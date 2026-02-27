export const MOCK_PLAYER = {
  id: 7654321, username:"sakura_beats", country:"JP", countryFlag:"🇯🇵",
  globalRank:14320, countryRank:832, pp:4287.6, accuracy:97.34,
  level:87, levelProgress:63, playCount:18430, playTime:"2847h",
  rankedScore:2841930000, totalScore:8103291000, maxCombo:2148,
  grades:{ SSH:12, SS:87, SH:43, S:312, A:691 },
  joined:"12 March 2019", badges:["osu!supporter","Mapper","Contributor"],
  topPlay:{ map:"Harumachi Clover", pp:412.4, stars:6.21 },
  rankHistory:[
    {date:"Jan",rank:18000},{date:"Feb",rank:17200},{date:"Mar",rank:16100},
    {date:"Apr",rank:15800},{date:"May",rank:15100},{date:"Jun",rank:14900},{date:"Jul",rank:14320}
  ],
  ppHistory:[
    {date:"Jan",pp:3800},{date:"Feb",pp:3940},{date:"Mar",pp:4050},
    {date:"Apr",pp:4120},{date:"May",pp:4180},{date:"Jun",pp:4240},{date:"Jul",pp:4287}
  ],
  recentActivity:[
    {map:"Senbonzakura",diff:"Insane",pp:180,acc:98.4,rank:"S",stars:5.2,date:"2h ago"},
    {map:"Freedom Dive",diff:"FOUR DIMENSIONS",pp:0,acc:94.1,rank:"A",stars:8.9,date:"5h ago"},
    {map:"Harumachi Clover",diff:"Fragrance",pp:412,acc:99.1,rank:"SS",stars:6.21,date:"1d ago"},
    {map:"Lovely Icecream",diff:"Extra",pp:220,acc:97.8,rank:"S",stars:5.8,date:"2d ago"},
    {map:"Blue Zenith",diff:"FOUR DIMENSIONS",pp:0,acc:91.2,rank:"A",stars:7.6,date:"3d ago"},
  ],
};

export const RECOMMENDED_MAPS = [
  {id:1,beatmapSetId:751882,title:"Harumachi Clover",artist:"Yuki Yuki",diff:"Fragrance",mapper:"Sotarks",stars:6.21,pp:412,bpm:170,ar:9.2,od:9,cs:4,length:"3:42",tags:["Jump","Stream"]},
  {id:2,beatmapSetId:128931,title:"Senbonzakura",artist:"Hatsune Miku",diff:"Insane",mapper:"xChippy",stars:5.2,pp:195,bpm:155,ar:9,od:8.5,cs:4,length:"4:10",tags:["Aim","Alternating"]},
  {id:3,beatmapSetId:1358449,title:"Lovely Icecream",artist:"Kobaryo",diff:"Extra",mapper:"snowball112",stars:5.8,pp:230,bpm:190,ar:9.3,od:9,cs:4,length:"2:28",tags:["Speed","Burst"]},
  {id:4,beatmapSetId:1001460,title:"Zetsubou no Shima",artist:"xi",diff:"EXHAUST",mapper:"Nakagawa-Kanon",stars:6.05,pp:390,bpm:185,ar:9.4,od:8.8,cs:4.2,length:"5:02",tags:["Technical","Complex"]},
  {id:5,beatmapSetId:1010865,title:"Camellia as Reverse of Riot",artist:"Camellia",diff:"Ground Assault",mapper:"Regou",stars:5.65,pp:260,bpm:175,ar:9.1,od:9,cs:4,length:"4:30",tags:["Aim","Stamina"]},
  {id:6,beatmapSetId:1257904,title:"Yoru ni Kakeru",artist:"YOASOBI",diff:"Voyage",mapper:"Delis",stars:5.5,pp:215,bpm:132,ar:9,od:8.5,cs:4,length:"4:18",tags:["Aim","Sliders"]},
  {id:7,beatmapSetId:1148213,title:"Goodbye Halcyon Days",artist:"t+pazolite",diff:"Daybreak",mapper:"handsome",stars:6.3,pp:445,bpm:210,ar:9.5,od:9.2,cs:4.3,length:"3:10",tags:["Technical","Speed"]},
  {id:8,beatmapSetId:577524,title:"Gensokyo Millenium",artist:"Silver Forest",diff:"Extra",mapper:"Halfslashed",stars:5.3,pp:188,bpm:165,ar:9,od:8,cs:4,length:"4:50",tags:["Aim","Jump"]},
  {id:9,beatmapSetId:374119,title:"Kira Kira Sensation",artist:"Love Live",diff:"Miracle",mapper:"alacat",stars:4.8,pp:155,bpm:150,ar:8.8,od:8.2,cs:4,length:"3:55",tags:["Aim","Easy Slider"]},
  {id:10,beatmapSetId:963951,title:"Conflict",artist:"Yuki Kajiura",diff:"Extreme",mapper:"PoNo",stars:6.4,pp:480,bpm:200,ar:9.6,od:9.5,cs:4.5,length:"2:50",tags:["Speed","Burst","Technical"]},
  {id:11,beatmapSetId:320118,title:"Sugar Song to Bitter Step",artist:"UNISON SQUARE GARDEN",diff:"Collab Extra",mapper:"Kibbleru",stars:5.7,pp:245,bpm:158,ar:9.1,od:9,cs:4,length:"4:05",tags:["Aim","Sliders"]},
  {id:12,beatmapSetId:461744,title:"Sayonara Memory",artist:"SKE48",diff:"Expert",mapper:"DeRandom",stars:5.0,pp:170,bpm:165,ar:9,od:8.5,cs:4,length:"3:30",tags:["Aim","Linear"]},
];

export const ADMIN_USERS = [
  {id:1,username:"sakura_beats",pp:4287,rank:14320,status:"active",role:"User",country:"JP",joined:"2019-03-12",plays:18430},
  {id:2,username:"moonlight_aim",pp:6120,rank:4890,status:"active",role:"Moderator",country:"KR",joined:"2018-07-22",plays:31200},
  {id:3,username:"xXstream_godXx",pp:2100,rank:42000,status:"banned",role:"User",country:"US",joined:"2021-01-05",plays:8900},
  {id:4,username:"CamelliaMaster",pp:8900,rank:1230,status:"active",role:"Admin",country:"PL",joined:"2016-09-30",plays:76000},
  {id:5,username:"aim_trainer99",pp:3450,rank:22100,status:"active",role:"User",country:"DE",joined:"2020-05-18",plays:14500},
  {id:6,username:"nyan_desu",pp:1800,rank:68000,status:"inactive",role:"User",country:"JP",joined:"2022-02-28",plays:4300},
];

