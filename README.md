# Zexl
The Zexl Minecraft Server aims to implement core functional Minecraft Server entirely in Javascript

# Features

## Currently implemented

- Joining world
- Chat (without encryption) and restart command

# Running

You can you it with `build.bat` or by running `node zexl` in a folder with the latest zexl.js and a config.json

# Velocity

currently Zexl supports Velocity with
* online-mode = true
* force-key-authentication = true
* player-info-forwarding-mode = "modern"

Which shoud be the standard on most velocity network's

although the Velocity Server tries do make it secure the Zexl Server currently doesn't check if it is valid.

# Credit

This project wouldn't be possible without the contributors of the [Minecraft wiki](https://minecraft.wiki/w/Java_Edition_protocol).
