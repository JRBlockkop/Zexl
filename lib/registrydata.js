const {TString} = require('./../data/types')
const Packet = require('./../data/packet')
const NbtTag = require('./../data/nbt')

function RegistryData(packet,id){
    return [
        new Packet( //0
            0x07,
            TString('minecraft:painting_variant')+
            '01'+
            TString('minecraft:meditative')+'00'
        ),
        new Packet( //1
            0x07,
            TString('minecraft:worldgen/biome')+
            '01'+
            TString('minecraft:plains')+'00'
        ),
        new Packet( //2
            0x07,
            TString('minecraft:damage_type')+
            '19'+
            TString('minecraft:cactus')+'00'+
            TString('minecraft:campfire')+'00'+
            TString('minecraft:cramming')+'00'+
            TString('minecraft:dragon_breath')+'00'+
            TString('minecraft:drown')+'00'+
            TString('minecraft:dry_out')+'00'+
            TString('minecraft:ender_pearl')+'00'+
            TString('minecraft:fall')+'00'+
            TString('minecraft:fly_into_wall')+'00'+
            TString('minecraft:freeze')+'00'+
            TString('minecraft:generic')+'00'+
            TString('minecraft:generic_kill')+'00'+
            TString('minecraft:hot_floor')+'00'+
            TString('minecraft:in_fire')+'00'+
            TString('minecraft:in_wall')+'00'+
            TString('minecraft:lava')+'00'+
            TString('minecraft:lightning_bolt')+'00'+
            TString('minecraft:magic')+'00'+
            TString('minecraft:on_fire')+'00'+
            TString('minecraft:out_of_world')+'00'+
            TString('minecraft:outside_border')+'00'+
            TString('minecraft:stalagmite')+'00'+
            TString('minecraft:starve')+'00'+
            TString('minecraft:sweet_berry_bush')+'00'+
            TString('minecraft:wither')+'00'
        ),
        new Packet( //3
            0x07,
            TString('minecraft:dimension_type')+
            '01'+
            TString('minecraft:overworld')+'01'+
            NbtTag.NetCompound([
                NbtTag.Double("coordinate_scale",1),
                NbtTag.Byte("has_skylight",1),
                NbtTag.Byte("has_ceiling",0),
                NbtTag.Float("ambient_light",0),
                NbtTag.Int("monster_spawn_block_light_limit",0),
                NbtTag.Int("monster_spawn_light_level",0),

                NbtTag.Int("logical_height",128),
                NbtTag.Int("min_y",0),
                NbtTag.Int("height",128),
                NbtTag.String("infiniburn","#infiniburn_overworld"),
                NbtTag.String("skybox","overworld"),
                NbtTag.String("cardinal_light","default"),
                //NbtTag.String("timelines","#minecraft:in_overworld")
            ])
        ),
        new Packet( //4
            0x07,
            TString('minecraft:frog_variant')+
            '03'+
            TString('minecraft:temperate')+'00'+
            TString('minecraft:warm')+'00'+
            TString('minecraft:cold')+'00'
        ),
        new Packet( //5
            0x07,
            TString('minecraft:chicken_variant')+
            '03'+
            TString('minecraft:temperate')+'00'+
            TString('minecraft:warm')+'00'+
            TString('minecraft:cold')+'00'
        ),
        new Packet( //6
            0x07,
            TString('minecraft:cow_variant')+
            '03'+
            TString('minecraft:temperate')+'00'+
            TString('minecraft:warm')+'00'+
            TString('minecraft:cold')+'00'
        ),
        new Packet( //7
            0x07,
            TString('minecraft:pig_variant')+
            '03'+
            TString('minecraft:temperate')+'00'+
            TString('minecraft:warm')+'00'+
            TString('minecraft:cold')+'00'
        ),
        new Packet( //8
            0x07,
            TString('minecraft:wolf_variant')+
            '01'+
            TString('minecraft:pale')+'00'
        ),
        new Packet( //9
            0x07,
            TString('minecraft:zombie_nautilus_variant')+
            '01'+
            TString('minecraft:temperate')+'00'
        ),
        new Packet( //10
            0x07,
            TString("minecraft:cat_variant") +
            '01'+
            TString("minecraft:tabby") + "00"
        ),
        new Packet( //11
            0x07,
            TString("minecraft:wolf_sound_variant") +
            '01'+
            TString("minecraft:classic") + "00"
        ),
        new Packet( //12
            0x03,
            ""
        )
    ]
}

module.exports.RegistryData = RegistryData