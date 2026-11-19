fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Jay.Dev'
description 'Custom In-Game Blip Creator'
version '1.0.0'

shared_scripts {
    'config.lua',
    'code/shared/*.lua',
}

client_script 'code/client/client.lua'

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'code/server/server.lua',
}

ui_page 'ui/dist/index.html'

files {
    'ui/dist/index.html',
    'ui/dist/assets/*',
}

dependency 'oxmysql'
