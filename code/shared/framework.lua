local function exists(resource)
    local state = GetResourceState(resource)
    return state ~= 'missing' and state ~= 'unknown'
end

function GetFramework()
    if Config.Framework ~= 'auto' then
        return Config.Framework
    end

    if exists('qbx_core') then
        return 'qbox'
    end

    if exists('qb-core') then
        return 'qb'
    end

    if exists('es_extended') then
        return 'esx'
    end

    return 'standalone'
end
