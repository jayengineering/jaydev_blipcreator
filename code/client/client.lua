local blips = {}
local menuOpen = false
local spriteCategories

local function notify(message, kind)
    kind = kind or 'inform'

    if GetResourceState('ox_lib') == 'started' then
        TriggerEvent('ox_lib:notify', { title = 'Blip Creator', description = message, type = kind })
        return
    end

    local framework = GetFramework()

    if framework == 'qb' or framework == 'qbox' then
        TriggerEvent('QBCore:Notify', message, kind == 'inform' and 'primary' or kind)
    elseif framework == 'esx' then
        TriggerEvent('esx:showNotification', message, kind == 'inform' and 'info' or kind)
    else
        BeginTextCommandThefeedPost('STRING')
        AddTextComponentSubstringPlayerName(message)
        EndTextCommandThefeedPostTicker(false, false)
    end
end

local function getSpriteCategories()
    if spriteCategories then
        return spriteCategories
    end

    local byName = {}
    spriteCategories = {}

    for _, sprite in ipairs(BlipSprites) do
        local category = byName[sprite.category]

        if not category then
            category = { name = sprite.category, sprites = {} }
            byName[sprite.category] = category
            spriteCategories[#spriteCategories + 1] = category
        end

        category.sprites[#category.sprites + 1] = { id = sprite.id, name = sprite.name }
    end

    table.sort(spriteCategories, function(a, b)
        return a.name < b.name
    end)

    return spriteCategories
end

local function removeBlips()
    for _, blip in pairs(blips) do
        if DoesBlipExist(blip.handle) then
            RemoveBlip(blip.handle)
        end
    end

    blips = {}
end

local function addBlip(data)
    local handle = AddBlipForCoord(data.coords.x + 0.0, data.coords.y + 0.0, data.coords.z + 0.0)

    SetBlipSprite(handle, data.sprite)
    SetBlipDisplay(handle, 4)
    SetBlipColour(handle, data.color)
    SetBlipScale(handle, data.scale + 0.0)
    SetBlipAsShortRange(handle, data.shortRange == true or data.shortRange == 1)

    BeginTextCommandSetBlipName('STRING')
    AddTextComponentSubstringPlayerName(data.name)
    EndTextCommandSetBlipName(handle)

    return handle
end

local function updateVisibility()
    local position = GetEntityCoords(PlayerPedId())

    for _, blip in pairs(blips) do
        if blip.nearbyOnly then
            local coords = blip.data.coords
            local inRange = #(position - vector3(coords.x, coords.y, coords.z)) <= Config.NearbyRange

            if inRange ~= blip.visible then
                SetBlipDisplay(blip.handle, inRange and 4 or 0)
                blip.visible = inRange
            end
        end
    end
end

local function blipList()
    local list = {}

    for _, blip in pairs(blips) do
        list[#list + 1] = blip.data
    end

    table.sort(list, function(a, b)
        return a.id < b.id
    end)

    return list
end

local function getNearestBlip()
    local position = GetEntityCoords(PlayerPedId())
    local nearest, nearestDistance

    for _, blip in pairs(blips) do
        local coords = blip.data.coords
        local distance = #(position - vector3(coords.x, coords.y, coords.z))

        if not nearestDistance or distance < nearestDistance then
            nearest, nearestDistance = blip.data, distance
        end
    end

    if nearest and nearestDistance <= Config.NearestDistance then
        return nearest
    end
end

local function openMenu()
    if menuOpen then
        return
    end

    menuOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'openMenu',
        blips = blipList(),
        commonColors = Config.Colors,
        spriteCategories = getSpriteCategories(),
        defaults = Config.DefaultBlip,
    })
end

local function closeMenu()
    if not menuOpen then
        return
    end

    menuOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'closeMenu' })
end

RegisterNetEvent('jaydev_blipcreator:client:sync', function(list)
    removeBlips()

    for _, data in ipairs(list) do
        blips[data.id] = {
            handle = addBlip(data),
            data = data,
            nearbyOnly = data.shortRange == true or data.shortRange == 1,
            visible = true,
        }
    end

    updateVisibility()

    if menuOpen then
        SendNUIMessage({ action = 'updateBlips', blips = blipList() })
    end
end)

RegisterNetEvent('jaydev_blipcreator:client:open', openMenu)

RegisterNetEvent('jaydev_blipcreator:client:notify', notify)

RegisterNUICallback('closeMenu', function(_, cb)
    closeMenu()
    cb({})
end)

RegisterNUICallback('createBlip', function(data, cb)
    local position = GetEntityCoords(PlayerPedId())

    data.coords = { x = position.x, y = position.y, z = position.z }
    TriggerServerEvent('jaydev_blipcreator:server:create', data)
    cb({ success = true })
end)

RegisterNUICallback('updateBlip', function(data, cb)
    TriggerServerEvent('jaydev_blipcreator:server:update', data)
    cb({ success = true })
end)

RegisterNUICallback('deleteBlip', function(data, cb)
    TriggerServerEvent('jaydev_blipcreator:server:delete', data.id)
    cb({ success = true })
end)

RegisterNUICallback('getNearestBlip', function(_, cb)
    local blip = getNearestBlip()

    if not blip then
        notify('No blips nearby.', 'error')
        cb({ success = false })
        return
    end

    cb({ success = true, blip = blip })
end)

RegisterCommand(Config.Command, function()
    TriggerServerEvent('jaydev_blipcreator:server:open')
end, false)

CreateThread(function()
    TriggerEvent('chat:addSuggestion', '/' .. Config.Command, 'Open the blip creator')
    TriggerServerEvent('jaydev_blipcreator:server:request')

    while true do
        Wait(1000)
        updateVisibility()
    end
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then
        return
    end

    removeBlips()

    if menuOpen then
        SetNuiFocus(false, false)
    end
end)
