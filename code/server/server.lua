local tableName = Config.DatabaseTable
local blips = {}
local allowedIdentifiers = {}
local core

for _, identifier in ipairs(Config.Permissions.identifiers) do
    allowedIdentifiers[identifier] = true
end

local function getCore()
    if core ~= nil then
        return core
    end

    local framework = GetFramework()

    if framework == 'qb' then
        core = exports['qb-core']:GetCoreObject()
    elseif framework == 'esx' then
        core = exports.es_extended:getSharedObject()
    else
        core = false
    end

    return core
end

local function notify(src, message, kind)
    TriggerClientEvent('jaydev_blipcreator:client:notify', src, message, kind)
end

local function hasIdentifier(src)
    for _, identifier in ipairs(GetPlayerIdentifiers(src)) do
        if allowedIdentifiers[identifier] then
            return true
        end
    end

    return false
end

local function hasGroup(src)
    local framework = GetFramework()
    local groups = Config.Permissions.groups

    for _, group in ipairs(groups) do
        if IsPlayerAceAllowed(src, group) or IsPlayerAceAllowed(src, 'group.' .. group) then
            return true
        end

        if framework == 'qbox' then
            local ok, allowed = pcall(function()
                return exports.qbx_core:HasPermission(src, group)
            end)

            if ok and allowed then
                return true
            end
        elseif framework == 'qb' and getCore() and getCore().Functions.HasPermission(src, group) then
            return true
        end
    end

    if framework == 'esx' and getCore() then
        local player = getCore().GetPlayerFromId(src)
        local playerGroup = player and player.getGroup()

        for _, group in ipairs(groups) do
            if playerGroup == group then
                return true
            end
        end
    end

    return false
end

local function canManage(src)
    return hasIdentifier(src) or hasGroup(src)
end

local function clamp(value, min, max, fallback)
    value = tonumber(value)

    if not value then
        return fallback
    end

    return math.max(min, math.min(max, value))
end

local function sanitize(data)
    if type(data) ~= 'table' then
        return nil
    end

    local defaults = Config.DefaultBlip
    local name = tostring(data.name or ''):gsub('^%s+', ''):gsub('%s+$', ''):sub(1, 50)

    return {
        name = name ~= '' and name or defaults.name,
        sprite = math.floor(clamp(data.sprite, 0, 1000, defaults.sprite)),
        color = math.floor(clamp(data.color, 0, 85, defaults.color)),
        scale = clamp(data.scale, 0.1, 2.0, defaults.scale),
        shortRange = data.shortRange == true,
    }
end

local function readCoords(coords)
    if type(coords) ~= 'table' and type(coords) ~= 'vector3' then
        return nil
    end

    local x = tonumber(coords.x or coords[1])
    local y = tonumber(coords.y or coords[2])
    local z = tonumber(coords.z or coords[3])

    if not x or not y or not z then
        return nil
    end

    return { x = x, y = y, z = z }
end

local function fromRow(row)
    local ok, coords = pcall(json.decode, row.coords)

    return {
        id = row.id,
        name = row.name,
        sprite = row.sprite,
        color = row.color,
        scale = row.scale,
        shortRange = row.shortRange == true or row.shortRange == 1,
        coords = ok and readCoords(coords) or nil,
    }
end

local function blipList()
    local list = {}

    for _, blip in pairs(blips) do
        list[#list + 1] = blip
    end

    table.sort(list, function(a, b)
        return a.id < b.id
    end)

    return list
end

local function syncAll()
    TriggerClientEvent('jaydev_blipcreator:client:sync', -1, blipList())
end

MySQL.ready(function()
    MySQL.query.await(([[
        CREATE TABLE IF NOT EXISTS `%s` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `name` VARCHAR(50) NOT NULL,
            `sprite` INT NOT NULL,
            `color` INT NOT NULL,
            `scale` FLOAT NOT NULL,
            `shortRange` TINYINT(1) NOT NULL DEFAULT 1,
            `display` INT NOT NULL DEFAULT 4,
            `coords` LONGTEXT NOT NULL,
            PRIMARY KEY (`id`)
        )
    ]]):format(tableName))

    local rows = MySQL.query.await(('SELECT * FROM `%s`'):format(tableName)) or {}

    for _, row in ipairs(rows) do
        local blip = fromRow(row)

        if blip.coords then
            blips[blip.id] = blip
        end
    end

    syncAll()
end)

RegisterNetEvent('jaydev_blipcreator:server:open', function()
    local src = source

    if not canManage(src) then
        notify(src, 'You do not have permission to use this.', 'error')
        return
    end

    TriggerClientEvent('jaydev_blipcreator:client:open', src)
end)

RegisterNetEvent('jaydev_blipcreator:server:request', function()
    TriggerClientEvent('jaydev_blipcreator:client:sync', source, blipList())
end)

RegisterNetEvent('jaydev_blipcreator:server:create', function(data)
    local src = source

    if not canManage(src) then
        return
    end

    local blip = sanitize(data)
    local coords = readCoords(data and data.coords)

    if not blip or not coords then
        return
    end

    local id = MySQL.insert.await(
        ('INSERT INTO `%s` (name, sprite, color, scale, shortRange, coords) VALUES (?, ?, ?, ?, ?, ?)'):format(tableName),
        { blip.name, blip.sprite, blip.color, blip.scale, blip.shortRange and 1 or 0, json.encode(coords) }
    )

    if not id then
        notify(src, 'Could not save the blip.', 'error')
        return
    end

    blip.id = id
    blip.coords = coords
    blips[id] = blip

    syncAll()
    notify(src, ('Created %s'):format(blip.name), 'success')
end)

RegisterNetEvent('jaydev_blipcreator:server:update', function(data)
    local src = source

    if not canManage(src) then
        return
    end

    local id = tonumber(data and data.id)
    local existing = id and blips[id]
    local blip = sanitize(data)

    if not existing or not blip then
        return
    end

    MySQL.update.await(
        ('UPDATE `%s` SET name = ?, sprite = ?, color = ?, scale = ?, shortRange = ? WHERE id = ?'):format(tableName),
        { blip.name, blip.sprite, blip.color, blip.scale, blip.shortRange and 1 or 0, id }
    )

    blip.id = id
    blip.coords = existing.coords
    blips[id] = blip

    syncAll()
    notify(src, ('Updated %s'):format(blip.name), 'success')
end)

RegisterNetEvent('jaydev_blipcreator:server:delete', function(id)
    local src = source
    id = tonumber(id)

    if not canManage(src) or not id or not blips[id] then
        return
    end

    MySQL.update.await(('DELETE FROM `%s` WHERE id = ?'):format(tableName), { id })

    local name = blips[id].name
    blips[id] = nil

    syncAll()
    notify(src, ('Deleted %s'):format(name), 'success')
end)
