export interface TaxAccount {
    Id: number
    Text: string
}

export interface TaxSubCategory {
    Id: number
    Text: string
    ParentId?: number
    Accounts: TaxAccount[]
}

export interface TaxCategory {
    Id: number
    Text: string
    SubCategories: TaxSubCategory[]
}

export const taxAccounts: TaxCategory[] = [

    {
        "Id": 1,
        "Text": "Tillgångar",
        "SubCategories": [
            {
                "Id": 10,
                "Text": "Immateriella anläggningstillgångar",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1010,
                        "Text": "Utvecklingsutgifter"
                    },
                    {
                        "Id": 1011,
                        "Text": "Balanserade utgifter för forskning och utveckling"
                    },
                    {
                        "Id": 1012,
                        "Text": "Balanserade utgifter för programvaror"
                    },
                    {
                        "Id": 1018,
                        "Text": "Ackumulerade nedskrivningar på balanserade utgifter"
                    },
                    {
                        "Id": 1019,
                        "Text": "Ackumulerade avskrivningar på balanserade utgifter"
                    },
                    {
                        "Id": 1020,
                        "Text": "Koncessioner m.m."
                    },
                    {
                        "Id": 1028,
                        "Text": "Ackumulerade nedskrivningar på koncessioner m.m."
                    },
                    {
                        "Id": 1029,
                        "Text": "Ackumulerade avskrivningar på koncessioner m.m."
                    },
                    {
                        "Id": 1030,
                        "Text": "Patent"
                    },
                    {
                        "Id": 1038,
                        "Text": "Ackumulerade nedskrivningar på patent"
                    },
                    {
                        "Id": 1039,
                        "Text": "Ackumulerade avskrivningar på patent"
                    },
                    {
                        "Id": 1040,
                        "Text": "Licenser"
                    },
                    {
                        "Id": 1048,
                        "Text": "Ackumulerade nedskrivningar på licenser"
                    },
                    {
                        "Id": 1049,
                        "Text": "Ackumulerade avskrivningar på licenser"
                    },
                    {
                        "Id": 1050,
                        "Text": "Varumärken"
                    },
                    {
                        "Id": 1058,
                        "Text": "Ackumulerade nedskrivningar på varumärken"
                    },
                    {
                        "Id": 1059,
                        "Text": "Ackumulerade avskrivningar på varumärken"
                    },
                    {
                        "Id": 1060,
                        "Text": "Hyresrätter, tomträtter och liknande"
                    },
                    {
                        "Id": 1068,
                        "Text": "Ackumulerade nedskrivningar på hyresrätter, tomträtter och liknande"
                    },
                    {
                        "Id": 1069,
                        "Text": "Ackumulerade avskrivningar på hyresrätter, tomträtter och liknande"
                    },
                    {
                        "Id": 1070,
                        "Text": "Goodwill"
                    },
                    {
                        "Id": 1078,
                        "Text": "Ackumulerade nedskrivningar på goodwill"
                    },
                    {
                        "Id": 1079,
                        "Text": "Ackumulerade avskrivningar på goodwill"
                    },
                    {
                        "Id": 1080,
                        "Text": "Pågående projekt och förskott för immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 1081,
                        "Text": "Pågående projekt för immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 1088,
                        "Text": "Förskott för immateriella anläggningstillgångar"
                    }
                ]
            },
            {
                "Id": 11,
                "Text": "Byggnader och mark",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1110,
                        "Text": "Byggnader"
                    },
                    {
                        "Id": 1111,
                        "Text": "Byggnader på egen mark"
                    },
                    {
                        "Id": 1112,
                        "Text": "Byggnader på annans mark"
                    },
                    {
                        "Id": 1118,
                        "Text": "Ackumulerade nedskrivningar på byggnader"
                    },
                    {
                        "Id": 1119,
                        "Text": "Ackumulerade avskrivningar på byggnader"
                    },
                    {
                        "Id": 1120,
                        "Text": "Förbättringsutgifter på annans fastighet"
                    },
                    {
                        "Id": 1129,
                        "Text": "Ackumulerade avskrivningar på förbättringsutgifter på annans fastighet"
                    },
                    {
                        "Id": 1130,
                        "Text": "Mark"
                    },
                    {
                        "Id": 1140,
                        "Text": "Tomter och obebyggda markområden"
                    },
                    {
                        "Id": 1150,
                        "Text": "Markanläggningar"
                    },
                    {
                        "Id": 1158,
                        "Text": "Ackumulerade nedskrivningar på markanläggningar"
                    },
                    {
                        "Id": 1159,
                        "Text": "Ackumulerade avskrivningar på markanläggningar"
                    },
                    {
                        "Id": 1180,
                        "Text": "Pågående nyanläggningar och förskott för byggnader och mark"
                    },
                    {
                        "Id": 1181,
                        "Text": "Pågående ny-, till- och ombyggnad"
                    },
                    {
                        "Id": 1188,
                        "Text": "Förskott för byggnader och mark"
                    }
                ]
            },
            {
                "Id": 12,
                "Text": "Maskiner och inventarier",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1210,
                        "Text": "Maskiner och andra tekniska anläggningar"
                    },
                    {
                        "Id": 1211,
                        "Text": "Maskiner"
                    },
                    {
                        "Id": 1213,
                        "Text": "Andra tekniska anläggningar"
                    },
                    {
                        "Id": 1218,
                        "Text": "Ackumulerade nedskrivningar på maskiner och andra tekniska anläggningar"
                    },
                    {
                        "Id": 1219,
                        "Text": "Ackumulerade avskrivningar på maskiner och andra tekniska anläggningar"
                    },
                    {
                        "Id": 1220,
                        "Text": "Inventarier och verktyg"
                    },
                    {
                        "Id": 1221,
                        "Text": "Inventarier"
                    },
                    {
                        "Id": 1222,
                        "Text": "Byggnadsinventarier"
                    },
                    {
                        "Id": 1223,
                        "Text": "Markinventarier"
                    },
                    {
                        "Id": 1225,
                        "Text": "Verktyg"
                    },
                    {
                        "Id": 1228,
                        "Text": "Ackumulerade nedskrivningar på inventarier och verktyg"
                    },
                    {
                        "Id": 1229,
                        "Text": "Ackumulerade avskrivningar på inventarier och verktyg"
                    },
                    {
                        "Id": 1230,
                        "Text": "Installationer"
                    },
                    {
                        "Id": 1231,
                        "Text": "Installationer på egen fastighet"
                    },
                    {
                        "Id": 1232,
                        "Text": "Installationer på annans fastig het"
                    },
                    {
                        "Id": 1238,
                        "Text": "Ackumulerade nedskrivningar på installationer"
                    },
                    {
                        "Id": 1239,
                        "Text": "Ackumulerade avskrivningar på installationer"
                    },
                    {
                        "Id": 1240,
                        "Text": "Bilar och andra transportmedel"
                    },
                    {
                        "Id": 1241,
                        "Text": "Personbilar"
                    },
                    {
                        "Id": 1242,
                        "Text": "Lastbilar"
                    },
                    {
                        "Id": 1243,
                        "Text": "Truckar"
                    },
                    {
                        "Id": 1244,
                        "Text": "Arbetsmaskiner"
                    },
                    {
                        "Id": 1245,
                        "Text": "Traktorer"
                    },
                    {
                        "Id": 1246,
                        "Text": "Motorcyklar, mopeder och skotrar"
                    },
                    {
                        "Id": 1247,
                        "Text": "Båtar, flygplan och helikoptrar"
                    },
                    {
                        "Id": 1248,
                        "Text": "Ackumulerade nedskrivningar på bilar och andra transportmedel"
                    },
                    {
                        "Id": 1249,
                        "Text": "Ackumulerade avskrivningar på bilar och andra transportmedel"
                    },
                    {
                        "Id": 1250,
                        "Text": "Datorer"
                    },
                    {
                        "Id": 1251,
                        "Text": "Datorer, företaget"
                    },
                    {
                        "Id": 1257,
                        "Text": "Datorer, personal"
                    },
                    {
                        "Id": 1258,
                        "Text": "Ackumulerade nedskrivningar på datorer"
                    },
                    {
                        "Id": 1259,
                        "Text": "Ackumulerade avskrivningar på datorer"
                    },
                    {
                        "Id": 1260,
                        "Text": "Leasade tillgångar"
                    },
                    {
                        "Id": 1269,
                        "Text": "Ackumulerade avskrivningar på leasade tillgångar"
                    },
                    {
                        "Id": 1280,
                        "Text": "Pågående nyanläggningar och förskott för maskiner och inventarier"
                    },
                    {
                        "Id": 1281,
                        "Text": "Pågående nyanläggningar, maskiner och inventarier"
                    },
                    {
                        "Id": 1288,
                        "Text": "Förskott för maskiner och inventarier"
                    },
                    {
                        "Id": 1290,
                        "Text": "Övriga materiella anläggningstillgångar"
                    },
                    {
                        "Id": 1291,
                        "Text": "Konst och liknande tillgångar"
                    },
                    {
                        "Id": 1292,
                        "Text": "Djur som klassificeras som anläggningstillgång"
                    },
                    {
                        "Id": 1298,
                        "Text": "Ackumulerade nedskrivningar på övriga materiella anläggningstillgångar"
                    },
                    {
                        "Id": 1299,
                        "Text": "Ackumulerade avskrivningar på övriga materiella anläggningstillgångar"
                    }
                ]
            },
            {
                "Id": 13,
                "Text": "Finansiella anläggningstillgångar",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1310,
                        "Text": "Andelar i koncernföretag"
                    },
                    {
                        "Id": 1311,
                        "Text": "Aktier i noterade svenska koncernföretag"
                    },
                    {
                        "Id": 1312,
                        "Text": "Aktier i onoterade svenska koncernföretag"
                    },
                    {
                        "Id": 1313,
                        "Text": "Aktier i noterade utländska koncernföretag"
                    },
                    {
                        "Id": 1314,
                        "Text": "Aktier i onoterade utländska koncernföretag"
                    },
                    {
                        "Id": 1316,
                        "Text": "Övriga andelar i koncernföretag"
                    },
                    {
                        "Id": 1318,
                        "Text": "Ackumulerade nedskrivningar av andelar i koncernföretag"
                    },
                    {
                        "Id": 1320,
                        "Text": "Långfristiga fordringar hos koncernföretag"
                    },
                    {
                        "Id": 1321,
                        "Text": "Långfristiga fordringar hos moderföretag"
                    },
                    {
                        "Id": 1322,
                        "Text": "Långfristiga fordringar hos dotterföretag"
                    },
                    {
                        "Id": 1323,
                        "Text": "Långfristiga fordringar hos andra koncernföretag"
                    },
                    {
                        "Id": 1328,
                        "Text": "Ackumulerade nedskrivningar av långfristiga fordringar hos koncernföretag"
                    },
                    {
                        "Id": 1330,
                        "Text": "Andelar i intresseföretag"
                    },
                    {
                        "Id": 1336,
                        "Text": "Andelar i ekonomiska föreningar, intresseföretag"
                    },
                    {
                        "Id": 1338,
                        "Text": "Ackumulerade nedskrivningar av andelar i intresseföretag"
                    },
                    {
                        "Id": 1340,
                        "Text": "Långfristiga fordringar hos intresseföretag"
                    },
                    {
                        "Id": 1348,
                        "Text": "Ackumulerade nedskrivningar av långfristiga fordringar hos intresseföretag"
                    },
                    {
                        "Id": 1350,
                        "Text": "Andelar och värdepapper i andra företag"
                    },
                    {
                        "Id": 1351,
                        "Text": "Andelar i börsnoterade företag"
                    },
                    {
                        "Id": 1352,
                        "Text": "Andra andelar"
                    },
                    {
                        "Id": 1353,
                        "Text": "Andelar i bostadsrättsföreningar"
                    },
                    {
                        "Id": 1354,
                        "Text": "Obligationer"
                    },
                    {
                        "Id": 1356,
                        "Text": "Andelar i ekonomiska föreningar, övriga företag"
                    },
                    {
                        "Id": 1358,
                        "Text": "Ackumulerade nedskrivningar av andra andelar och värdepapper"
                    },
                    {
                        "Id": 1360,
                        "Text": "Lån till delägare eller närstående, långfristig del"
                    },
                    {
                        "Id": 1369,
                        "Text": "Ackumulerade nedskrivningar på lån till delägare eller närstående, långfristig del"
                    },
                    {
                        "Id": 1370,
                        "Text": "Uppskjuten skattefordran"
                    },
                    {
                        "Id": 1380,
                        "Text": "Andra långfristiga fordringar"
                    },
                    {
                        "Id": 1381,
                        "Text": "Långfristiga reversfordringar"
                    },
                    {
                        "Id": 1382,
                        "Text": "Långfristiga fordringar hos anställda"
                    },
                    {
                        "Id": 1383,
                        "Text": "Lämnade depositioner, långfristiga"
                    },
                    {
                        "Id": 1384,
                        "Text": "Derivat"
                    },
                    {
                        "Id": 1385,
                        "Text": "Värde av kapitalförsäkring"
                    },
                    {
                        "Id": 1386,
                        "Text": "Förutbetalda leasingavgifter, långfristig del"
                    },
                    {
                        "Id": 1387,
                        "Text": "Långfristiga kontraktsfordringar"
                    },
                    {
                        "Id": 1389,
                        "Text": "Ackumulerade nedskrivningar av andra långfristiga fordringar"
                    }
                ]
            },
            {
                "Id": 14,
                "Text": "Lager, produkter i arbete och pågående arbeten",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1410,
                        "Text": "Lager av råvaror"
                    },
                    {
                        "Id": 1419,
                        "Text": "Förändring av lager av råvaror"
                    },
                    {
                        "Id": 1420,
                        "Text": "Lager av tillsatsmaterial och förnödenheter"
                    },
                    {
                        "Id": 1429,
                        "Text": "Förändring av lager av tillsatsmaterial och förnödenheter"
                    },
                    {
                        "Id": 1430,
                        "Text": "Lager av halvfabrikat"
                    },
                    {
                        "Id": 1431,
                        "Text": "Lager av köpta halvfabrikat"
                    },
                    {
                        "Id": 1432,
                        "Text": "Lager av egentillverkade halvfabrikat"
                    },
                    {
                        "Id": 1438,
                        "Text": "Förändring av lager av köpta halvfabrikat"
                    },
                    {
                        "Id": 1439,
                        "Text": "Förändring av lager av egentillverkade halvfabrikat"
                    },
                    {
                        "Id": 1440,
                        "Text": "Produkter i arbete"
                    },
                    {
                        "Id": 1449,
                        "Text": "Förändring av produkter i arbete"
                    },
                    {
                        "Id": 1450,
                        "Text": "Lager av färdiga varor"
                    },
                    {
                        "Id": 1459,
                        "Text": "Förändring av lager av färdiga varor"
                    },
                    {
                        "Id": 1460,
                        "Text": "Lager av handelsvaror"
                    },
                    {
                        "Id": 1465,
                        "Text": "Lager av varor VMB"
                    },
                    {
                        "Id": 1466,
                        "Text": "Nedskrivning av varor VMB"
                    },
                    {
                        "Id": 1467,
                        "Text": "Lager av varor VMB förenklad"
                    },
                    {
                        "Id": 1469,
                        "Text": "Förändring av lager av handelsvaror"
                    },
                    {
                        "Id": 1470,
                        "Text": "Pågående arbeten"
                    },
                    {
                        "Id": 1471,
                        "Text": "Pågående arbeten, nedlagda kostnader"
                    },
                    {
                        "Id": 1478,
                        "Text": "Pågående arbeten, fakturering"
                    },
                    {
                        "Id": 1479,
                        "Text": "Förändring av pågående arbeten"
                    },
                    {
                        "Id": 1480,
                        "Text": "Förskott för varor och tjänster"
                    },
                    {
                        "Id": 1481,
                        "Text": "Remburser"
                    },
                    {
                        "Id": 1489,
                        "Text": "Övriga förskott till leverantörer"
                    },
                    {
                        "Id": 1490,
                        "Text": "Övriga lagertillgångar"
                    },
                    {
                        "Id": 1491,
                        "Text": "Lager av värdepapper"
                    },
                    {
                        "Id": 1492,
                        "Text": "Lager av fastigheter"
                    },
                    {
                        "Id": 1493,
                        "Text": "Djur som klassificeras som omsättningstillgång"
                    }
                ]
            },
            {
                "Id": 15,
                "Text": "Kundfordringar",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1510,
                        "Text": "Kundfordringar"
                    },
                    {
                        "Id": 1511,
                        "Text": "Kundfordringar"
                    },
                    {
                        "Id": 1512,
                        "Text": "Belånade kundfordringar (factoring)"
                    },
                    {
                        "Id": 1513,
                        "Text": "Kundfordringar – delad faktura"
                    },
                    {
                        "Id": 1515,
                        "Text": "Osäkra kundfordringar"
                    },
                    {
                        "Id": 1516,
                        "Text": "Tvistiga kundfordringar"
                    },
                    {
                        "Id": 1518,
                        "Text": "Ej reskontraförda kundfordringar"
                    },
                    {
                        "Id": 1519,
                        "Text": "Nedskrivning av kundfordringar"
                    },
                    {
                        "Id": 1520,
                        "Text": "Växelfordringar"
                    },
                    {
                        "Id": 1525,
                        "Text": "Osäkra växelfordringar"
                    },
                    {
                        "Id": 1529,
                        "Text": "Nedskrivning av växelfordringar"
                    },
                    {
                        "Id": 1530,
                        "Text": "Kontraktsfordringar"
                    },
                    {
                        "Id": 1531,
                        "Text": "Kontraktsfordringar"
                    },
                    {
                        "Id": 1532,
                        "Text": "Belånade kontraktsfordringar"
                    },
                    {
                        "Id": 1535,
                        "Text": "Osäkra kontraktsfordringar"
                    },
                    {
                        "Id": 1536,
                        "Text": "Tvistiga kontraktsfordringar"
                    },
                    {
                        "Id": 1539,
                        "Text": "Nedskrivning av kontraktsfordringar"
                    },
                    {
                        "Id": 1550,
                        "Text": "Konsignationsfordringar"
                    },
                    {
                        "Id": 1560,
                        "Text": "Kundfordringar hos koncernföretag"
                    },
                    {
                        "Id": 1561,
                        "Text": "Kundfordringar hos moderföretag"
                    },
                    {
                        "Id": 1562,
                        "Text": "Kundfordringar hos dotterföretag"
                    },
                    {
                        "Id": 1563,
                        "Text": "Kundfordringar hos andra koncernföretag"
                    },
                    {
                        "Id": 1565,
                        "Text": "Osäkra kundfordringar hos koncernföretag"
                    },
                    {
                        "Id": 1568,
                        "Text": "Ej reskontraförda kundfordringar hos koncernföretag"
                    },
                    {
                        "Id": 1569,
                        "Text": "Nedskrivning av kundfordringar hos koncernföretag"
                    },
                    {
                        "Id": 1570,
                        "Text": "Kundfordringar hos intresseföretag"
                    },
                    {
                        "Id": 1575,
                        "Text": "Osäkra kundfordringar hos intresseföretag"
                    },
                    {
                        "Id": 1578,
                        "Text": "Ej reskontraförda kundfordringar hos intresseföretag"
                    },
                    {
                        "Id": 1579,
                        "Text": "Nedskrivning av kundfordringar hos intresseföretag"
                    },
                    {
                        "Id": 1580,
                        "Text": "Fordringar för kontokort och kuponger"
                    }
                ]
            },
            {
                "Id": 16,
                "Text": "Övriga kortfristiga fordringar",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1610,
                        "Text": "Kortfristiga fordringar hos anställda"
                    },
                    {
                        "Id": 1611,
                        "Text": "Reseförskott"
                    },
                    {
                        "Id": 1612,
                        "Text": "Kassaförskott"
                    },
                    {
                        "Id": 1613,
                        "Text": "Övriga förskott"
                    },
                    {
                        "Id": 1614,
                        "Text": "Tillfälliga lån till anställda"
                    },
                    {
                        "Id": 1619,
                        "Text": "Övriga fordringar hos anställda"
                    },
                    {
                        "Id": 1620,
                        "Text": "Upparbetad men ej fakturerad intäkt"
                    },
                    {
                        "Id": 1630,
                        "Text": "Avräkning för skatter och avgifter (skattekonto)"
                    },
                    {
                        "Id": 1640,
                        "Text": "Skattefordringar"
                    },
                    {
                        "Id": 1650,
                        "Text": "Momsfordran"
                    },
                    {
                        "Id": 1660,
                        "Text": "Kortfristiga fordringar hos koncernföretag"
                    },
                    {
                        "Id": 1661,
                        "Text": "Kortfristiga fordringar hos moderföretag"
                    },
                    {
                        "Id": 1662,
                        "Text": "Kortfristiga fordringar hos dotterföretag"
                    },
                    {
                        "Id": 1663,
                        "Text": "Kortfristiga fordringar hos andra koncernföretag"
                    },
                    {
                        "Id": 1670,
                        "Text": "Kortfristiga fordringar hos intresseföretag"
                    },
                    {
                        "Id": 1680,
                        "Text": "Andra kortfristiga fordringar"
                    },
                    {
                        "Id": 1681,
                        "Text": "Utlägg för kunder"
                    },
                    {
                        "Id": 1682,
                        "Text": "Kortfristiga lånefordringar"
                    },
                    {
                        "Id": 1683,
                        "Text": "Derivat"
                    },
                    {
                        "Id": 1684,
                        "Text": "Kortfristiga fordringar hos leverantörer"
                    },
                    {
                        "Id": 1685,
                        "Text": "Kortfristiga fordringar hos delägare eller närstående"
                    },
                    {
                        "Id": 1687,
                        "Text": "Kortfristig del av långfristiga fordringar"
                    },
                    {
                        "Id": 1688,
                        "Text": "Fordran arbetsmarknadsförsäkringar"
                    },
                    {
                        "Id": 1689,
                        "Text": "Övriga kortfristiga fordringar"
                    },
                    {
                        "Id": 1690,
                        "Text": "Fordringar för tecknat men ej inbetalt aktiekapital"
                    }
                ]
            },
            {
                "Id": 17,
                "Text": "Förutbetalda kostnader och upplupna intäkter",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1710,
                        "Text": "Förutbetalda hyreskostnader"
                    },
                    {
                        "Id": 1720,
                        "Text": "Förutbetalda leasingavgifter, kortfristig del"
                    },
                    {
                        "Id": 1730,
                        "Text": "Förutbetalda försäkringspremier"
                    },
                    {
                        "Id": 1740,
                        "Text": "Förutbetalda räntekostnader"
                    },
                    {
                        "Id": 1750,
                        "Text": "Upplupna hyresintäkter"
                    },
                    {
                        "Id": 1760,
                        "Text": "Upplupna ränteintäkter"
                    },
                    {
                        "Id": 1770,
                        "Text": "Tillgångar av kostnadsnatur"
                    },
                    {
                        "Id": 1780,
                        "Text": "Upplupna avtalsintäkter"
                    },
                    {
                        "Id": 1790,
                        "Text": "Övriga förutbetalda kostnader och upplupna intäkter"
                    }
                ]
            },
            {
                "Id": 18,
                "Text": "Kortfristiga placeringar",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1810,
                        "Text": "Andelar i börsnoterade företag"
                    },
                    {
                        "Id": 1820,
                        "Text": "Obligationer"
                    },
                    {
                        "Id": 1830,
                        "Text": "Konvertibla skuldebrev"
                    },
                    {
                        "Id": 1860,
                        "Text": "Andelar i koncernföretag"
                    },
                    {
                        "Id": 1869,
                        "Text": "Nedskrivning av andelar i koncernföretag"
                    },
                    {
                        "Id": 1880,
                        "Text": "Andra kortfristiga placeringar"
                    },
                    {
                        "Id": 1886,
                        "Text": "Derivat"
                    },
                    {
                        "Id": 1889,
                        "Text": "Andelar i övriga företag"
                    },
                    {
                        "Id": 1890,
                        "Text": "Nedskrivning av kortfristiga placeringar"
                    }
                ]
            },
            {
                "Id": 19,
                "Text": "Kassa och bank",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 1910,
                        "Text": "Kassa"
                    },
                    {
                        "Id": 1911,
                        "Text": "Huvudkassa"
                    },
                    {
                        "Id": 1912,
                        "Text": "Kassa 2"
                    },
                    {
                        "Id": 1913,
                        "Text": "Kassa 3"
                    },
                    {
                        "Id": 1914,
                        "Text": "Kassa 4"
                    },
                    {
                        "Id": 1920,
                        "Text": "PlusGiro"
                    },
                    {
                        "Id": 1930,
                        "Text": "Företagskonto / affärskonto"
                    },
                    {
                        "Id": 1931,
                        "Text": "Sparkonto"
                    },
                    {
                        "Id": 1932,
                        "Text": "Bokio Företagskonto"
                    },
                    {
                        "Id": 1940,
                        "Text": "Övriga bankkonton"
                    },
                    {
                        "Id": 1950,
                        "Text": "Bankcertifikat"
                    },
                    {
                        "Id": 1960,
                        "Text": "Koncernkonto moderföretag"
                    },
                    {
                        "Id": 1970,
                        "Text": "Särskilda bankkonton"
                    },
                    {
                        "Id": 1972,
                        "Text": "Upphovsmannakonto"
                    },
                    {
                        "Id": 1973,
                        "Text": "Skogskonto"
                    },
                    {
                        "Id": 1974,
                        "Text": "Spärrade bankmedel"
                    },
                    {
                        "Id": 1979,
                        "Text": "Övriga särskilda bankkonton"
                    },
                    {
                        "Id": 1980,
                        "Text": "Valutakonton"
                    },
                    {
                        "Id": 1990,
                        "Text": "Redovisningsmedel"
                    }
                ]
            }
        ]
    },
    {
        "Id": 2,
        "Text": "Eget kapital och skulder",
        "SubCategories": [
            {
                "Id": 20,
                "Text": "Eget kapital",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2010,
                        "Text": "Eget kapital, delägare 1"
                    },
                    {
                        "Id": 2011,
                        "Text": "Egna varuuttag"
                    },
                    {
                        "Id": 2012,
                        "Text": "Avräkning för skatter och avgifter (skattekonto)"
                    },
                    {
                        "Id": 2013,
                        "Text": "Övriga egna uttag"
                    },
                    {
                        "Id": 2017,
                        "Text": "Årets kapitaltillskott"
                    },
                    {
                        "Id": 2018,
                        "Text": "Övriga egna insättningar"
                    },
                    {
                        "Id": 2019,
                        "Text": "Årets resultat, delägare 1"
                    },
                    {
                        "Id": 2020,
                        "Text": "Eget kapital, delägare 2"
                    },
                    {
                        "Id": 2023,
                        "Text": "Egna uttag delägare 2 (Handelsbolag)"
                    },
                    {
                        "Id": 2028,
                        "Text": "Övriga egna insättningar, delägare 2"
                    },
                    {
                        "Id": 2029,
                        "Text": "Årets resultat, delägare 2"
                    },
                    {
                        "Id": 2030,
                        "Text": "Eget kapital, delägare 3"
                    },
                    {
                        "Id": 2033,
                        "Text": "Egna uttag delägare 3 (Handelsbolag)"
                    },
                    {
                        "Id": 2038,
                        "Text": "Övriga egna insättningar, delägare 3"
                    },
                    {
                        "Id": 2039,
                        "Text": "Årets resultat, delägare 3"
                    },
                    {
                        "Id": 2040,
                        "Text": "Eget kapital, delägare 4"
                    },
                    {
                        "Id": 2043,
                        "Text": "Egna uttag delägare 4 (Handelsbolag)"
                    },
                    {
                        "Id": 2048,
                        "Text": "Övriga egna insättningar, delägare 4"
                    },
                    {
                        "Id": 2049,
                        "Text": "Årets resultat, delägare 4"
                    },
                    {
                        "Id": 2050,
                        "Text": "Avsättning till expansionsfond"
                    },
                    {
                        "Id": 2060,
                        "Text": "Eget kapital i ideella föreningar, stiftelser och registrerade trossamfund"
                    },
                    {
                        "Id": 2061,
                        "Text": "Eget kapital/stiftelsekapital/grundkapital"
                    },
                    {
                        "Id": 2065,
                        "Text": "Förändring i fond för verkligt värde"
                    },
                    {
                        "Id": 2066,
                        "Text": "Värdesäkringsfond"
                    },
                    {
                        "Id": 2067,
                        "Text": "Balanserad vinst eller förlust/balanserat kapital"
                    },
                    {
                        "Id": 2068,
                        "Text": "Vinst eller förlust från föregående år"
                    },
                    {
                        "Id": 2069,
                        "Text": "Årets resultat"
                    },
                    {
                        "Id": 2070,
                        "Text": "Ändamålsbestämda medel"
                    },
                    {
                        "Id": 2071,
                        "Text": "Ändamål 1"
                    },
                    {
                        "Id": 2072,
                        "Text": "Ändamål 2"
                    },
                    {
                        "Id": 2080,
                        "Text": "Bundet eget kapital"
                    },
                    {
                        "Id": 2081,
                        "Text": "Aktiekapital"
                    },
                    {
                        "Id": 2082,
                        "Text": "Ej registrerat aktiekapital"
                    },
                    {
                        "Id": 2083,
                        "Text": "Medlemsinsatser"
                    },
                    {
                        "Id": 2084,
                        "Text": "Förlagsinsatser"
                    },
                    {
                        "Id": 2085,
                        "Text": "Uppskrivningsfond"
                    },
                    {
                        "Id": 2086,
                        "Text": "Reservfond"
                    },
                    {
                        "Id": 2087,
                        "Text": "Insatsemission"
                    },
                    {
                        "Id": 2088,
                        "Text": "Fond för yttre underhåll"
                    },
                    {
                        "Id": 2090,
                        "Text": "Fritt eget kapital"
                    },
                    {
                        "Id": 2091,
                        "Text": "Balanserad vinst eller förlust"
                    },
                    {
                        "Id": 2092,
                        "Text": "Mottagna/lämnade koncernbidrag"
                    },
                    {
                        "Id": 2093,
                        "Text": "Erhållna aktieägartillskott"
                    },
                    {
                        "Id": 2094,
                        "Text": "Egna aktier"
                    },
                    {
                        "Id": 2095,
                        "Text": "Fusionsresultat"
                    },
                    {
                        "Id": 2096,
                        "Text": "Fond för verkligt värde"
                    },
                    {
                        "Id": 2097,
                        "Text": "Överkursfond"
                    },
                    {
                        "Id": 2098,
                        "Text": "Vinst eller förlust från föregående år"
                    },
                    {
                        "Id": 2099,
                        "Text": "Årets resultat"
                    }
                ]
            },
            {
                "Id": 21,
                "Text": "Obeskattade reserver",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2110,
                        "Text": "Periodiseringsfond vid 2010 års taxering"
                    },
                    {
                        "Id": 2111,
                        "Text": "Periodiseringsfond vid 2011 års taxering"
                    },
                    {
                        "Id": 2112,
                        "Text": "Periodiseringsfond vid 2012 års taxering"
                    },
                    {
                        "Id": 2113,
                        "Text": "Periodiseringsfond vid 2013 års taxering"
                    },
                    {
                        "Id": 2120,
                        "Text": "Periodiseringsfonder"
                    },
                    {
                        "Id": 2121,
                        "Text": "Periodiseringsfonder"
                    },
                    {
                        "Id": 2122,
                        "Text": "Periodiseringsfonder"
                    },
                    {
                        "Id": 2123,
                        "Text": "Periodiseringsfond 2020"
                    },
                    {
                        "Id": 2124,
                        "Text": "Periodiseringsfond 2021"
                    },
                    {
                        "Id": 2125,
                        "Text": "Periodiseringsfond 2022"
                    },
                    {
                        "Id": 2126,
                        "Text": "Periodiseringsfond 2023"
                    },
                    {
                        "Id": 2127,
                        "Text": "Periodiseringsfond 2017"
                    },
                    {
                        "Id": 2128,
                        "Text": "Periodiseringsfond 2018"
                    },
                    {
                        "Id": 2129,
                        "Text": "Periodiseringsfond 2019"
                    },
                    {
                        "Id": 2150,
                        "Text": "Ackumulerade överavskrivningar"
                    },
                    {
                        "Id": 2151,
                        "Text": "Ackumulerade överavskrivningar på immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 2152,
                        "Text": "Ackumulerade överavskrivningar på byggnader och markanläggningar"
                    },
                    {
                        "Id": 2153,
                        "Text": "Ackumulerade överavskrivningar på maskiner och inventarier"
                    },
                    {
                        "Id": 2160,
                        "Text": "Ersättningsfond"
                    },
                    {
                        "Id": 2161,
                        "Text": "Ersättningsfond maskiner och inventarier"
                    },
                    {
                        "Id": 2162,
                        "Text": "Ersättningsfond byggnader och markanläggningar"
                    },
                    {
                        "Id": 2163,
                        "Text": "Ersättningsfond mark"
                    },
                    {
                        "Id": 2164,
                        "Text": "Ersättningsfond för djurlager i jordbruk och renskötsel"
                    },
                    {
                        "Id": 2180,
                        "Text": "Obeskattade intäkter"
                    },
                    {
                        "Id": 2181,
                        "Text": "Obeskattade upphovsmannaintäkter"
                    },
                    {
                        "Id": 2185,
                        "Text": "Obeskattade skogsintäkter"
                    },
                    {
                        "Id": 2190,
                        "Text": "Övriga obeskattade reserver"
                    },
                    {
                        "Id": 2196,
                        "Text": "Lagerreserv"
                    },
                    {
                        "Id": 2199,
                        "Text": "Övriga obeskattade reserver"
                    }
                ]
            },
            {
                "Id": 22,
                "Text": "Avsättningar",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2210,
                        "Text": "Avsättningar för pensioner enligt tryggandelagen"
                    },
                    {
                        "Id": 2220,
                        "Text": "Avsättningar för garantier"
                    },
                    {
                        "Id": 2230,
                        "Text": "Övriga avsättningar för pensioner och liknande förpliktelser"
                    },
                    {
                        "Id": 2240,
                        "Text": "Avsättningar för uppskjutna skatter"
                    },
                    {
                        "Id": 2250,
                        "Text": "Övriga avsättningar för skatter"
                    },
                    {
                        "Id": 2252,
                        "Text": "Avsättningar för tvistiga skatter"
                    },
                    {
                        "Id": 2253,
                        "Text": "Avsättningar särskild löneskatt, deklarationspost"
                    },
                    {
                        "Id": 2290,
                        "Text": "Övriga avsättningar"
                    }
                ]
            },
            {
                "Id": 23,
                "Text": "Långfristiga skulder",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2310,
                        "Text": "Obligations- och förlagslån"
                    },
                    {
                        "Id": 2320,
                        "Text": "Konvertibla lån och liknande"
                    },
                    {
                        "Id": 2321,
                        "Text": "Konvertibla lån"
                    },
                    {
                        "Id": 2322,
                        "Text": "Lån förenade med optionsrätt"
                    },
                    {
                        "Id": 2323,
                        "Text": "Vinstandelslån"
                    },
                    {
                        "Id": 2324,
                        "Text": "Kapitalandelslån"
                    },
                    {
                        "Id": 2330,
                        "Text": "Checkräkningskredit"
                    },
                    {
                        "Id": 2340,
                        "Text": "Byggnadskreditiv"
                    },
                    {
                        "Id": 2350,
                        "Text": "Andra långfristiga skulder till kreditinstitut"
                    },
                    {
                        "Id": 2351,
                        "Text": "Fastighetslån, långfristig del"
                    },
                    {
                        "Id": 2355,
                        "Text": "Långfristiga lån i utländsk valuta från kreditinstitut"
                    },
                    {
                        "Id": 2359,
                        "Text": "Övriga långfristiga lån från kreditinstitut"
                    },
                    {
                        "Id": 2360,
                        "Text": "Långfristiga skulder till koncernföretag"
                    },
                    {
                        "Id": 2361,
                        "Text": "Långfristiga skulder till moderföretag"
                    },
                    {
                        "Id": 2362,
                        "Text": "Långfristiga skulder till dotterföretag"
                    },
                    {
                        "Id": 2363,
                        "Text": "Långfristiga skulder till andra koncernföretag"
                    },
                    {
                        "Id": 2370,
                        "Text": "Långfristiga skulder till intresseföretag"
                    },
                    {
                        "Id": 2390,
                        "Text": "Övriga långfristiga skulder"
                    },
                    {
                        "Id": 2391,
                        "Text": "Avbetalningskontrakt, långfristig del"
                    },
                    {
                        "Id": 2392,
                        "Text": "Villkorliga långfristiga skulder"
                    },
                    {
                        "Id": 2393,
                        "Text": "Lån från närstående personer, långfristig del"
                    },
                    {
                        "Id": 2394,
                        "Text": "Långfristiga leverantörskrediter"
                    },
                    {
                        "Id": 2395,
                        "Text": "Andra långfristiga lån i utländsk valuta"
                    },
                    {
                        "Id": 2396,
                        "Text": "Derivat"
                    },
                    {
                        "Id": 2397,
                        "Text": "Mottagna depositioner, långfristiga"
                    },
                    {
                        "Id": 2399,
                        "Text": "Övriga långfristiga skulder"
                    }
                ]
            },
            {
                "Id": 24,
                "Text": "Kortfristiga skulder till kreditinstitut, kunder och leverantörer",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2410,
                        "Text": "Andra kortfristiga låneskulder till kreditinstitut"
                    },
                    {
                        "Id": 2411,
                        "Text": "Kortfristiga lån från kreditinstitut"
                    },
                    {
                        "Id": 2417,
                        "Text": "Kortfristig del av långfristiga skulder till kreditinstitut"
                    },
                    {
                        "Id": 2419,
                        "Text": "Övriga kortfristiga skulder till kreditinstitut"
                    },
                    {
                        "Id": 2420,
                        "Text": "Förskott från kunder"
                    },
                    {
                        "Id": 2421,
                        "Text": "Ej inlösta presentkort"
                    },
                    {
                        "Id": 2429,
                        "Text": "Övriga förskott från kunder"
                    },
                    {
                        "Id": 2430,
                        "Text": "Pågående arbeten"
                    },
                    {
                        "Id": 2431,
                        "Text": "Pågående arbeten, fakturering"
                    },
                    {
                        "Id": 2438,
                        "Text": "Pågående arbeten, nedlagda kostnader"
                    },
                    {
                        "Id": 2439,
                        "Text": "Beräknad förändring av pågående arbeten"
                    },
                    {
                        "Id": 2440,
                        "Text": "Leverantörsskulder"
                    },
                    {
                        "Id": 2441,
                        "Text": "Leverantörsskulder"
                    },
                    {
                        "Id": 2443,
                        "Text": "Konsignationsskulder"
                    },
                    {
                        "Id": 2445,
                        "Text": "Tvistiga leverantörsskulder"
                    },
                    {
                        "Id": 2448,
                        "Text": "Ej reskontraförda leverantörsskulder"
                    },
                    {
                        "Id": 2450,
                        "Text": "Fakturerad men ej upparbetad intäkt"
                    },
                    {
                        "Id": 2460,
                        "Text": "Leverantörsskulder till koncernföretag"
                    },
                    {
                        "Id": 2461,
                        "Text": "Leverantörsskulder till moderföretag"
                    },
                    {
                        "Id": 2462,
                        "Text": "Leverantörsskulder till dotterföretag"
                    },
                    {
                        "Id": 2463,
                        "Text": "Leverantörsskulder till andra koncernföretag"
                    },
                    {
                        "Id": 2470,
                        "Text": "Leverantörsskulder till intresseföretag"
                    },
                    {
                        "Id": 2480,
                        "Text": "Checkräkningskredit, kortfristig"
                    },
                    {
                        "Id": 2490,
                        "Text": "Övriga kortfristiga skulder till kreditinstitut, kunder och leverantörer"
                    },
                    {
                        "Id": 2491,
                        "Text": "Avräkning spelarrangörer"
                    },
                    {
                        "Id": 2492,
                        "Text": "Växelskulder"
                    },
                    {
                        "Id": 2499,
                        "Text": "Andra övriga kortfristiga skulder"
                    }
                ]
            },
            {
                "Id": 25,
                "Text": "Skatteskulder",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2510,
                        "Text": "Skatteskulder"
                    },
                    {
                        "Id": 2512,
                        "Text": "Beräknad inkomstskatt"
                    },
                    {
                        "Id": 2513,
                        "Text": "Beräknad fastighetsskatt/fastighetsavgift"
                    },
                    {
                        "Id": 2514,
                        "Text": "Beräknad särskild löneskatt på pensionskostnader"
                    },
                    {
                        "Id": 2515,
                        "Text": "Beräknad avkastningsskatt"
                    },
                    {
                        "Id": 2516,
                        "Text": "Moms"
                    },
                    {
                        "Id": 2517,
                        "Text": "Beräknad utländsk skatt"
                    },
                    {
                        "Id": 2518,
                        "Text": "Betald F-skatt"
                    }
                ]
            },
            {
                "Id": 26,
                "Text": "Moms och särskilda punktskatter",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2610,
                        "Text": "Utgående moms, 25 %"
                    },
                    {
                        "Id": 2611,
                        "Text": "Utgående moms på försäljning inom Sverige, 25 %"
                    },
                    {
                        "Id": 2612,
                        "Text": "Utgående moms på egna uttag, 25 %"
                    },
                    {
                        "Id": 2613,
                        "Text": "Utgående moms för uthyrning, 25 %"
                    },
                    {
                        "Id": 2614,
                        "Text": "Utgående moms omvänd skattskyldighet, 25 %"
                    },
                    {
                        "Id": 2615,
                        "Text": "Utgående moms import av varor, 25%"
                    },
                    {
                        "Id": 2616,
                        "Text": "Utgående moms VMB 25 %"
                    },
                    {
                        "Id": 2617,
                        "Text": "Utgående moms omvänd skattskyldighet varor och tjänster i Sverige, 25 %"
                    },
                    {
                        "Id": 2618,
                        "Text": "Vilande utgående moms, 25 %"
                    },
                    {
                        "Id": 2620,
                        "Text": "Utgående moms, 12 %"
                    },
                    {
                        "Id": 2621,
                        "Text": "Utgående moms på försäljning inom Sverige, 12 %"
                    },
                    {
                        "Id": 2622,
                        "Text": "Utgående moms på egna uttag, 12 %"
                    },
                    {
                        "Id": 2623,
                        "Text": "Utgående moms för uthyrning, 12 %"
                    },
                    {
                        "Id": 2624,
                        "Text": "Utgående moms omvänd skattskyldighet, 12 %"
                    },
                    {
                        "Id": 2625,
                        "Text": "Utgående moms import av varor, 12 %"
                    },
                    {
                        "Id": 2626,
                        "Text": "Utgående moms VMB 12 %"
                    },
                    {
                        "Id": 2627,
                        "Text": "Utgående moms omvänd skattskyldighet varor och tjänster i Sverige, 12 %"
                    },
                    {
                        "Id": 2628,
                        "Text": "Vilande utgående moms, 12 %"
                    },
                    {
                        "Id": 2630,
                        "Text": "Utgående moms, 6 %"
                    },
                    {
                        "Id": 2631,
                        "Text": "Utgående moms på försäljning inom Sverige, 6 %"
                    },
                    {
                        "Id": 2632,
                        "Text": "Utgående moms på egna uttag, 6 %"
                    },
                    {
                        "Id": 2633,
                        "Text": "Utgående moms för uthyrning, 6 %"
                    },
                    {
                        "Id": 2634,
                        "Text": "Utgående moms omvänd skattskyldighet, 6 %"
                    },
                    {
                        "Id": 2635,
                        "Text": "Utgående moms import av varor, 6 %"
                    },
                    {
                        "Id": 2636,
                        "Text": "Utgående moms VMB 6 %"
                    },
                    {
                        "Id": 2637,
                        "Text": "Utgående moms omvänd skattskyldighet varor och tjänster i Sverige, 6 %"
                    },
                    {
                        "Id": 2638,
                        "Text": "Vilande utgående moms, 6 %"
                    },
                    {
                        "Id": 2640,
                        "Text": "Ingående moms"
                    },
                    {
                        "Id": 2641,
                        "Text": "Debiterad ingående moms"
                    },
                    {
                        "Id": 2642,
                        "Text": "Debiterad ingående moms i anslutning till frivillig skattskyldighet"
                    },
                    {
                        "Id": 2645,
                        "Text": "Beräknad ingående moms på förvärv från utlandet"
                    },
                    {
                        "Id": 2646,
                        "Text": "Ingående moms på uthyrning"
                    },
                    {
                        "Id": 2647,
                        "Text": "Ingående moms omvänd skattskyldighet varor och tjänster i Sverige"
                    },
                    {
                        "Id": 2648,
                        "Text": "Vilande ingående moms"
                    },
                    {
                        "Id": 2649,
                        "Text": "Ingående moms, blandad verksamhet"
                    },
                    {
                        "Id": 2650,
                        "Text": "Redovisningskonto för moms"
                    },
                    {
                        "Id": 2660,
                        "Text": "Särskilda punktskatter"
                    },
                    {
                        "Id": 2661,
                        "Text": "Reklamskatt"
                    },
                    {
                        "Id": 2668,
                        "Text": "OSS, moms"
                    },
                    {
                        "Id": 2669,
                        "Text": "Övriga punktskatter"
                    }
                ]
            },
            {
                "Id": 27,
                "Text": "Personalens skatter, avgifter och löneavdrag",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2710,
                        "Text": "Personalskatt"
                    },
                    {
                        "Id": 2730,
                        "Text": "Lagstadgade sociala avgifter och särskild löneskatt"
                    },
                    {
                        "Id": 2731,
                        "Text": "Avräkning lagstadgade sociala avgifter"
                    },
                    {
                        "Id": 2732,
                        "Text": "Avräkning särskild löneskatt"
                    },
                    {
                        "Id": 2740,
                        "Text": "Avtalade sociala avgifter"
                    },
                    {
                        "Id": 2750,
                        "Text": "Utmätning i lön m.m."
                    },
                    {
                        "Id": 2760,
                        "Text": "Semestermedel"
                    },
                    {
                        "Id": 2761,
                        "Text": "Avräkning semesterlöner"
                    },
                    {
                        "Id": 2762,
                        "Text": "Semesterlönekassa"
                    },
                    {
                        "Id": 2790,
                        "Text": "Övriga löneavdrag"
                    },
                    {
                        "Id": 2791,
                        "Text": "Personalens intressekonto"
                    },
                    {
                        "Id": 2792,
                        "Text": "Lönsparande"
                    },
                    {
                        "Id": 2793,
                        "Text": "Gruppförsäkringspremier"
                    },
                    {
                        "Id": 2794,
                        "Text": "Fackföreningsavgifter"
                    },
                    {
                        "Id": 2795,
                        "Text": "Mätnings- och granskningsarvoden"
                    },
                    {
                        "Id": 2799,
                        "Text": "Övriga löneavdrag"
                    }
                ]
            },
            {
                "Id": 28,
                "Text": "Övriga kortfristiga skulder",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2810,
                        "Text": "Avräkning för factoring och belånade kontraktsfordringar"
                    },
                    {
                        "Id": 2811,
                        "Text": "Avräkning för factoring"
                    },
                    {
                        "Id": 2812,
                        "Text": "Avräkning för belånade kontraktsfordringar"
                    },
                    {
                        "Id": 2820,
                        "Text": "Kortfristiga skulder till anställda"
                    },
                    {
                        "Id": 2821,
                        "Text": "Löneskulder"
                    },
                    {
                        "Id": 2822,
                        "Text": "Reseräkningar"
                    },
                    {
                        "Id": 2823,
                        "Text": "Tantiem, gratifikationer"
                    },
                    {
                        "Id": 2829,
                        "Text": "Övriga kortfristiga skulder till anställda"
                    },
                    {
                        "Id": 2830,
                        "Text": "Avräkning för annans räkning"
                    },
                    {
                        "Id": 2840,
                        "Text": "Kortfristiga låneskulder"
                    },
                    {
                        "Id": 2841,
                        "Text": "Kortfristig del av långfristiga skulder"
                    },
                    {
                        "Id": 2849,
                        "Text": "Övriga kortfristiga låneskulder"
                    },
                    {
                        "Id": 2850,
                        "Text": "Avräkning för skatter och avgifter (skattekonto)"
                    },
                    {
                        "Id": 2860,
                        "Text": "Kortfristiga skulder till koncernföretag"
                    },
                    {
                        "Id": 2861,
                        "Text": "Kortfristiga skulder till moderföretag"
                    },
                    {
                        "Id": 2862,
                        "Text": "Kortfristiga skulder till dotterföretag"
                    },
                    {
                        "Id": 2863,
                        "Text": "Kortfristiga skulder till andra koncernföretag"
                    },
                    {
                        "Id": 2870,
                        "Text": "Kortfristiga skulder till intresseföretag"
                    },
                    {
                        "Id": 2880,
                        "Text": "Skuld erhållna bidrag"
                    },
                    {
                        "Id": 2890,
                        "Text": "Övriga kortfristiga skulder"
                    },
                    {
                        "Id": 2891,
                        "Text": "Skulder under indrivning"
                    },
                    {
                        "Id": 2892,
                        "Text": "Inre reparationsfond/underhållsfond"
                    },
                    {
                        "Id": 2893,
                        "Text": "Skulder till närstående personer, kortfristig del"
                    },
                    {
                        "Id": 2895,
                        "Text": "Derivat (kortfristiga skulder)"
                    },
                    {
                        "Id": 2897,
                        "Text": "Mottagna depositioner, kortfristiga"
                    },
                    {
                        "Id": 2898,
                        "Text": "Outtagen vinstutdelning"
                    },
                    {
                        "Id": 2899,
                        "Text": "Övriga kortfristiga skulder"
                    }
                ]
            },
            {
                "Id": 29,
                "Text": "Upplupna kostnader och förutbetalda intäkter",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 2910,
                        "Text": "Upplupna löner"
                    },
                    {
                        "Id": 2911,
                        "Text": "Löneskulder"
                    },
                    {
                        "Id": 2912,
                        "Text": "Ackordsöverskott"
                    },
                    {
                        "Id": 2919,
                        "Text": "Övriga upplupna löner"
                    },
                    {
                        "Id": 2920,
                        "Text": "Upplupna semesterlöner"
                    },
                    {
                        "Id": 2930,
                        "Text": "Upplupna pensionskostnader"
                    },
                    {
                        "Id": 2931,
                        "Text": "Upplupna pensionsutbetalningar"
                    },
                    {
                        "Id": 2940,
                        "Text": "Upplupna lagstadgade sociala och andra avgifter"
                    },
                    {
                        "Id": 2941,
                        "Text": "Beräknade upplupna lagstadgade sociala avgifter"
                    },
                    {
                        "Id": 2942,
                        "Text": "Beräknad upplupen särskild löneskatt"
                    },
                    {
                        "Id": 2943,
                        "Text": "Beräknad upplupen särskild löneskatt på pensionskostnader, deklarationspost"
                    },
                    {
                        "Id": 2944,
                        "Text": "Beräknad upplupen avkastningsskatt på pensionskostnader"
                    },
                    {
                        "Id": 2950,
                        "Text": "Upplupna avtalade sociala avgifter"
                    },
                    {
                        "Id": 2951,
                        "Text": "Upplupna avtalade arbetsmarknadsförsäkringar"
                    },
                    {
                        "Id": 2959,
                        "Text": "Upplupna avtalade pensionsförsäkringsavgifter, deklarationspost"
                    },
                    {
                        "Id": 2960,
                        "Text": "Upplupna räntekostnader"
                    },
                    {
                        "Id": 2970,
                        "Text": "Förutbetalda intäkter"
                    },
                    {
                        "Id": 2971,
                        "Text": "Förutbetalda hyresintäkter"
                    },
                    {
                        "Id": 2972,
                        "Text": "Förutbetalda medlemsavgifter"
                    },
                    {
                        "Id": 2979,
                        "Text": "Övriga förutbetalda intäkter"
                    },
                    {
                        "Id": 2980,
                        "Text": "Upplupna avtalskostnader"
                    },
                    {
                        "Id": 2990,
                        "Text": "Övriga upplupna kostnader och förutbetalda intäkter"
                    },
                    {
                        "Id": 2991,
                        "Text": "Beräknat arvode för bokslut"
                    },
                    {
                        "Id": 2992,
                        "Text": "Beräknat arvode för revision"
                    },
                    {
                        "Id": 2993,
                        "Text": "Ospecificerad skuld till leverantörer"
                    },
                    {
                        "Id": 2998,
                        "Text": "Övriga upplupna kostnader och förutbetalda intäkter"
                    },
                    {
                        "Id": 2999,
                        "Text": "OBS-konto"
                    }
                ]
            }
        ]
    },
    {
        "Id": 3,
        "Text": "Rörelsens inkomster/intäkter",
        "SubCategories": [
            {
                "Id": 30,
                "Text": "Försäljning inom Sverige",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3000,
                        "Text": "Försäljning inom Sverige"
                    },
                    {
                        "Id": 3001,
                        "Text": "Försäljning varor inom Sverige, 25 % moms"
                    },
                    {
                        "Id": 3002,
                        "Text": "Försäljning varor inom Sverige, 12 % moms"
                    },
                    {
                        "Id": 3003,
                        "Text": "Försäljning varor inom Sverige, 6 % moms"
                    },
                    {
                        "Id": 3004,
                        "Text": "Försäljning varor inom Sverige, momsfri"
                    },
                    {
                        "Id": 3011,
                        "Text": "Försäljning tjänster inom Sverige, 25 % moms"
                    },
                    {
                        "Id": 3012,
                        "Text": "Försäljning tjänster inom Sverige, 12 % moms"
                    },
                    {
                        "Id": 3013,
                        "Text": "Försäljning tjänster inom Sverige, 6 % moms"
                    },
                    {
                        "Id": 3014,
                        "Text": "Försäljning tjänster inom Sverige, momsfri"
                    },
                    {
                        "Id": 3071,
                        "Text": "Förutbetalda intäkter, varor och tjänster"
                    },
                    {
                        "Id": 3089,
                        "Text": "Försäljning inom Sverige, momsfri"
                    },
                    {
                        "Id": 3099,
                        "Text": "Justering av försäljning, ej moms"
                    }
                ]
            },
            {
                "Id": 31,
                "Text": "Försäljning av varor utanför Sverige",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3105,
                        "Text": "Försäljning varor till land utanför EU"
                    },
                    {
                        "Id": 3106,
                        "Text": "Försäljning varor till annat EU-land, momspliktig"
                    },
                    {
                        "Id": 3107,
                        "Text": "Treparts försäljn varor till EU"
                    },
                    {
                        "Id": 3108,
                        "Text": "Försäljning varor till annat EU-land, momsfri"
                    }
                ]
            },
            {
                "Id": 32,
                "Text": "Försäljning VMB och omvänd moms",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3200,
                        "Text": "Försäljning VMB och omvänd moms"
                    },
                    {
                        "Id": 3211,
                        "Text": "Försäljning positiv VMB 25 %"
                    },
                    {
                        "Id": 3212,
                        "Text": "Försäljning negativ VMB 25 %"
                    },
                    {
                        "Id": 3223,
                        "Text": "Positiv VM omföringskonto"
                    },
                    {
                        "Id": 3231,
                        "Text": "Försäljning inom byggsektorn, omvänd skattskyldighet moms"
                    }
                ]
            },
            {
                "Id": 33,
                "Text": "Försäljning av tjänster utanför Sverige",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3305,
                        "Text": "Försäljning tjänster till land utanför EU"
                    },
                    {
                        "Id": 3308,
                        "Text": "Försäljning tjänster till annat EU-land"
                    },
                    {
                        "Id": 3389,
                        "Text": "Försäljning EU moms/OSS"
                    }
                ]
            },
            {
                "Id": 34,
                "Text": "Försäljning, egna uttag",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3401,
                        "Text": "Egna uttag momspliktiga, 25 %"
                    },
                    {
                        "Id": 3402,
                        "Text": "Egna uttag momspliktiga, 12 %"
                    },
                    {
                        "Id": 3403,
                        "Text": "Egna uttag momspliktiga, 6 %"
                    },
                    {
                        "Id": 3404,
                        "Text": "Egna uttag, momsfria"
                    }
                ]
            },
            {
                "Id": 35,
                "Text": "Fakturerade kostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3500,
                        "Text": "Fakturerade kostnader (gruppkonto)"
                    },
                    {
                        "Id": 3510,
                        "Text": "Fakturerat emballage"
                    },
                    {
                        "Id": 3511,
                        "Text": "Fakturerat emballage"
                    },
                    {
                        "Id": 3518,
                        "Text": "Returnerat emballage"
                    },
                    {
                        "Id": 3520,
                        "Text": "Fakturerade frakter"
                    },
                    {
                        "Id": 3521,
                        "Text": "Fakturerade frakter, EU-land"
                    },
                    {
                        "Id": 3522,
                        "Text": "Fakturerade frakter, export"
                    },
                    {
                        "Id": 3530,
                        "Text": "Fakturerade tull- och speditionskostnader m.m."
                    },
                    {
                        "Id": 3540,
                        "Text": "Faktureringsavgifter"
                    },
                    {
                        "Id": 3541,
                        "Text": "Faktureringsavgifter, EU-land"
                    },
                    {
                        "Id": 3542,
                        "Text": "Faktureringsavgifter, export"
                    },
                    {
                        "Id": 3550,
                        "Text": "Fakturerade resekostnader"
                    },
                    {
                        "Id": 3560,
                        "Text": "Fakturerade kostnader till koncernföretag"
                    },
                    {
                        "Id": 3561,
                        "Text": "Fakturerade kostnader till moderföretag"
                    },
                    {
                        "Id": 3562,
                        "Text": "Fakturerade kostnader till dotterföretag"
                    },
                    {
                        "Id": 3563,
                        "Text": "Fakturerade kostnader till andra koncernföretag"
                    },
                    {
                        "Id": 3570,
                        "Text": "Fakturerade kostnader till intresseföretag"
                    },
                    {
                        "Id": 3590,
                        "Text": "Övriga fakturerade kostnader"
                    }
                ]
            },
            {
                "Id": 36,
                "Text": "Rörelsens sidointäkter",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3600,
                        "Text": "Rörelsens sidointäkter (gruppkonto)"
                    },
                    {
                        "Id": 3610,
                        "Text": "Försäljning av material"
                    },
                    {
                        "Id": 3611,
                        "Text": "Försäljning av råmaterial"
                    },
                    {
                        "Id": 3612,
                        "Text": "Försäljning av skrot"
                    },
                    {
                        "Id": 3613,
                        "Text": "Försäljning av förbrukningsmaterial"
                    },
                    {
                        "Id": 3619,
                        "Text": "Försäljning av övrigt material"
                    },
                    {
                        "Id": 3620,
                        "Text": "Tillfällig uthyrning av personal"
                    },
                    {
                        "Id": 3630,
                        "Text": "Tillfällig uthyrning av transportmedel"
                    },
                    {
                        "Id": 3670,
                        "Text": "Intäkter från värdepapper"
                    },
                    {
                        "Id": 3671,
                        "Text": "Försäljning av värdepapper"
                    },
                    {
                        "Id": 3672,
                        "Text": "Utdelning från värdepapper"
                    },
                    {
                        "Id": 3679,
                        "Text": "Övriga intäkter från värdepapper"
                    },
                    {
                        "Id": 3680,
                        "Text": "Management fees"
                    },
                    {
                        "Id": 3690,
                        "Text": "Övriga sidointäkter"
                    }
                ]
            },
            {
                "Id": 37,
                "Text": "Intäktskorrigeringar",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3700,
                        "Text": "Intäktskorrigeringar (gruppkonto)"
                    },
                    {
                        "Id": 3710,
                        "Text": "Ofördelade intäktsreduktioner"
                    },
                    {
                        "Id": 3730,
                        "Text": "Lämnade rabatter"
                    },
                    {
                        "Id": 3731,
                        "Text": "Lämnade kassarabatter"
                    },
                    {
                        "Id": 3732,
                        "Text": "Lämnade mängdrabatter"
                    },
                    {
                        "Id": 3740,
                        "Text": "Öres- och kronutjämning"
                    },
                    {
                        "Id": 3750,
                        "Text": "Punktskatter"
                    },
                    {
                        "Id": 3751,
                        "Text": "Intäktsförda punktskatter (kreditkonto)"
                    },
                    {
                        "Id": 3752,
                        "Text": "Skuldförda punktskatter (debetkonto)"
                    },
                    {
                        "Id": 3790,
                        "Text": "Övriga intäktskorrigeringar"
                    }
                ]
            },
            {
                "Id": 38,
                "Text": "Aktiverat arbete för egen räkning",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3800,
                        "Text": "Aktiverat arbete för egen räkning (gruppkonto)"
                    },
                    {
                        "Id": 3840,
                        "Text": "Aktiverat arbete (material)"
                    },
                    {
                        "Id": 3850,
                        "Text": "Aktiverat arbete (omkostnader)"
                    },
                    {
                        "Id": 3870,
                        "Text": "Aktiverat arbete (personal)"
                    }
                ]
            },
            {
                "Id": 39,
                "Text": "Övriga rörelseintäkter",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 3900,
                        "Text": "Övriga rörelseintäkter (gruppkonto)"
                    },
                    {
                        "Id": 3910,
                        "Text": "Hyres- och arrendeintäkter"
                    },
                    {
                        "Id": 3911,
                        "Text": "Hyresintäkter"
                    },
                    {
                        "Id": 3912,
                        "Text": "Arrendeintäkter"
                    },
                    {
                        "Id": 3913,
                        "Text": "Frivilligt momspliktiga hyresintäkter"
                    },
                    {
                        "Id": 3914,
                        "Text": "Övriga momspliktiga hyresintäkter"
                    },
                    {
                        "Id": 3920,
                        "Text": "Provisionsintäkter, licensintäkter och royalties"
                    },
                    {
                        "Id": 3921,
                        "Text": "Provisionsintäkter"
                    },
                    {
                        "Id": 3922,
                        "Text": "Licensintäkter och royalties"
                    },
                    {
                        "Id": 3925,
                        "Text": "Franchiseintäkter"
                    },
                    {
                        "Id": 3929,
                        "Text": "Kickback momsfri"
                    },
                    {
                        "Id": 3930,
                        "Text": "Påminnelseavgifter på intäkter (kundfakturor)"
                    },
                    {
                        "Id": 3940,
                        "Text": "Orealiserade negativa/positiva värdeförändringar på säkringsinstrument"
                    },
                    {
                        "Id": 3950,
                        "Text": "Återvunna, tidigare avskrivna kundfordringar"
                    },
                    {
                        "Id": 3960,
                        "Text": "Valutakursvinster på fordringar och skulder av rörelsekaraktär"
                    },
                    {
                        "Id": 3970,
                        "Text": "Vinst vid avyttring av immateriella och materiella anläggningstillgångar"
                    },
                    {
                        "Id": 3971,
                        "Text": "Vinst vid avyttring av immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 3972,
                        "Text": "Vinst vid avyttring av byggnader och mark"
                    },
                    {
                        "Id": 3973,
                        "Text": "Vinst vid avyttring av maskiner och inventarier"
                    },
                    {
                        "Id": 3980,
                        "Text": "Erhållna offentliga stöd m.m."
                    },
                    {
                        "Id": 3981,
                        "Text": "Erhållna EU-bidrag"
                    },
                    {
                        "Id": 3985,
                        "Text": "Erhållna statliga bidrag"
                    },
                    {
                        "Id": 3987,
                        "Text": "Erhållna kommunala bidrag"
                    },
                    {
                        "Id": 3988,
                        "Text": "Erhållna bidrag och ersättningar för personal"
                    },
                    {
                        "Id": 3989,
                        "Text": "Övriga erhållna bidrag"
                    },
                    {
                        "Id": 3990,
                        "Text": "Övriga ersättningar och intäkter"
                    },
                    {
                        "Id": 3991,
                        "Text": "Konfliktersättning"
                    },
                    {
                        "Id": 3992,
                        "Text": "Erhållna skadestånd"
                    },
                    {
                        "Id": 3993,
                        "Text": "Erhållna donationer och gåvor"
                    },
                    {
                        "Id": 3994,
                        "Text": "Försäkringsersättningar"
                    },
                    {
                        "Id": 3995,
                        "Text": "Erhållet ackord på skulder av rörelsekaraktär"
                    },
                    {
                        "Id": 3996,
                        "Text": "Erhållna reklambidrag"
                    },
                    {
                        "Id": 3997,
                        "Text": "Sjuklöneersättning"
                    },
                    {
                        "Id": 3998,
                        "Text": "Sjukpenning"
                    },
                    {
                        "Id": 3999,
                        "Text": "Övriga rörelseintäkter"
                    }
                ]
            }
        ]
    },
    {
        "Id": 4,
        "Text": "Utgifter/kostnader för varor, material och vissa köpta tjänster",
        "SubCategories": [
            {
                "Id": 40,
                "Text": "Inköp av varor och material",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 4000,
                        "Text": "Inköp av varor från Sverige"
                    },
                    {
                        "Id": 4010,
                        "Text": "Inköp material och varor"
                    }
                ]
            },
            {
                "Id": 42,
                "Text": "Sålda varor VMB",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 4200,
                        "Text": "Sålda varor VMB"
                    },
                    {
                        "Id": 4211,
                        "Text": "Sålda varor positiv VMB 25 %"
                    },
                    {
                        "Id": 4212,
                        "Text": "Sålda varor negativ VMB 25 %"
                    }
                ]
            },
            {
                "Id": 44,
                "Text": "Inköpta tjänster i Sverige, omvänd skattskyldighet",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 4400,
                        "Text": "Inköpta tjänster i Sverige, omvänd skattskyldighet"
                    },
                    {
                        "Id": 4415,
                        "Text": "Inköpta varor i Sverige, omvänd skattskyldighet, 25 %"
                    },
                    {
                        "Id": 4416,
                        "Text": "Inköpta varor i Sverige, omvänd skattskyldighet, 12 %"
                    },
                    {
                        "Id": 4417,
                        "Text": "Inköpta varor i Sverige, omvänd skattskyldighet, 6 %"
                    },
                    {
                        "Id": 4425,
                        "Text": "Inköpta tjänster i Sverige, omvänd skattskyldighet, 25 %"
                    },
                    {
                        "Id": 4426,
                        "Text": "Inköpta tjänster i Sverige, omvänd skattskyldighet, 12 %"
                    },
                    {
                        "Id": 4427,
                        "Text": "Inköpta tjänster i Sverige, omvänd skattskyldighet, 6 %"
                    }
                ]
            },
            {
                "Id": 45,
                "Text": "Inköp utanför Sverige",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 4500,
                        "Text": "Inköp utanför Sverige"
                    },
                    {
                        "Id": 4512,
                        "Text": "Förvärv varor, trepartsförvärv från annat EU-land, mellan man"
                    },
                    {
                        "Id": 4515,
                        "Text": "Inköp av varor från annat EU-land, 25 %"
                    },
                    {
                        "Id": 4516,
                        "Text": "Inköp av varor från annat EU-land, 12 %"
                    },
                    {
                        "Id": 4517,
                        "Text": "Inköp av varor från annat EU-land, 6 %"
                    },
                    {
                        "Id": 4518,
                        "Text": "Inköp av varor från annat EU-land, momsfri"
                    },
                    {
                        "Id": 4531,
                        "Text": "Import tjänster land utanför EU, 25% moms"
                    },
                    {
                        "Id": 4532,
                        "Text": "Import tjänster land utanför EU, 12% moms"
                    },
                    {
                        "Id": 4533,
                        "Text": "Import tjänster land utanför EU, 6% moms"
                    },
                    {
                        "Id": 4534,
                        "Text": "Import tjänster land utanför EU, momsfri"
                    },
                    {
                        "Id": 4535,
                        "Text": "Inköp av tjänster från annat EU-land, 25 %"
                    },
                    {
                        "Id": 4536,
                        "Text": "Inköp av tjänster från annat EU-land, 12 %"
                    },
                    {
                        "Id": 4537,
                        "Text": "Inköp av tjänster från annat EU-land, 6 %"
                    },
                    {
                        "Id": 4538,
                        "Text": "Inköp av tjänster från annat EU-land, momsfri"
                    },
                    {
                        "Id": 4545,
                        "Text": "Import av varor, 25 % moms"
                    },
                    {
                        "Id": 4546,
                        "Text": "Import av varor, 12 % moms"
                    },
                    {
                        "Id": 4547,
                        "Text": "Import av varor, 6 % moms"
                    },
                    {
                        "Id": 4549,
                        "Text": "Motkonto beskattningsunderlag import"
                    },
                    {
                        "Id": 4598,
                        "Text": "Justering, omvänd moms"
                    }
                ]
            },
            {
                "Id": 46,
                "Text": "Legoarbeten, underentreprenader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 4600,
                        "Text": "Legoarbeten och underentreprenader (gruppkonto)"
                    }
                ]
            },
            {
                "Id": 47,
                "Text": "Reduktion av inköpspriser",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 4700,
                        "Text": "Reduktion av inköpspriser (gruppkonto)"
                    },
                    {
                        "Id": 4730,
                        "Text": "Erhållna rabatter"
                    },
                    {
                        "Id": 4731,
                        "Text": "Erhållna kassarabatter"
                    },
                    {
                        "Id": 4732,
                        "Text": "Erhållna mängdrabatter (inkl. bonus)"
                    },
                    {
                        "Id": 4733,
                        "Text": "Erhållet aktivitetsstöd"
                    },
                    {
                        "Id": 4790,
                        "Text": "Övriga reduktioner av inköpspriser"
                    }
                ]
            },
            {
                "Id": 49,
                "Text": "Förändring av lager, produkter i arbete och pågående arbeten",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 4900,
                        "Text": "Förändring av lager (gruppkonto)"
                    },
                    {
                        "Id": 4910,
                        "Text": "Förändring av lager av råvaror"
                    },
                    {
                        "Id": 4920,
                        "Text": "Förändring av lager av tillsatsmaterial och förnödenheter"
                    },
                    {
                        "Id": 4930,
                        "Text": "Förändring av lager av halvfabrikat"
                    },
                    {
                        "Id": 4931,
                        "Text": "Förändring av lager av köpta halvfabrikat"
                    },
                    {
                        "Id": 4932,
                        "Text": "Förändring av lager av egentillverkade halvfabrikat"
                    },
                    {
                        "Id": 4940,
                        "Text": "Förändring av produkter i arbete"
                    },
                    {
                        "Id": 4944,
                        "Text": "Förändring av produkter i arbete, material och utlägg"
                    },
                    {
                        "Id": 4945,
                        "Text": "Förändring av produkter i arbete, omkostnader"
                    },
                    {
                        "Id": 4947,
                        "Text": "Förändring av produkter i arbete, personalkostnader"
                    },
                    {
                        "Id": 4950,
                        "Text": "Förändring av lager av färdiga varor"
                    },
                    {
                        "Id": 4960,
                        "Text": "Förändring av lager av handelsvaror"
                    },
                    {
                        "Id": 4970,
                        "Text": "Förändring av pågående arbeten, nedlagda kostnader"
                    },
                    {
                        "Id": 4974,
                        "Text": "Förändring av pågående arbeten, material och utlägg"
                    },
                    {
                        "Id": 4975,
                        "Text": "Förändring av pågående arbeten, omkostnader"
                    },
                    {
                        "Id": 4977,
                        "Text": "Förändring av pågående arbeten, personalkostnader"
                    },
                    {
                        "Id": 4980,
                        "Text": "Förändring av lager av värdepapper"
                    },
                    {
                        "Id": 4981,
                        "Text": "Sålda värdepappers anskaffningsvärde"
                    },
                    {
                        "Id": 4987,
                        "Text": "Nedskrivning av värdepapper"
                    },
                    {
                        "Id": 4988,
                        "Text": "Återföring av nedskrivning av värdepapper"
                    },
                    {
                        "Id": 4990,
                        "Text": "Förändring av lager och pågående arbeten (ofördelad)"
                    }
                ]
            }
        ]
    },
    {
        "Id": 5,
        "Text": "Övriga externa rörelseutgifter/ kostnader",
        "SubCategories": [
            {
                "Id": 50,
                "Text": "Lokalkostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5000,
                        "Text": "Lokalkostnader (gruppkonto)"
                    },
                    {
                        "Id": 5010,
                        "Text": "Lokalhyra"
                    },
                    {
                        "Id": 5011,
                        "Text": "Hyra för kontorslokaler"
                    },
                    {
                        "Id": 5012,
                        "Text": "Hyra för garage"
                    },
                    {
                        "Id": 5013,
                        "Text": "Hyra för lagerlokaler"
                    },
                    {
                        "Id": 5020,
                        "Text": "El för belysning"
                    },
                    {
                        "Id": 5030,
                        "Text": "Värme"
                    },
                    {
                        "Id": 5040,
                        "Text": "Vatten och avlopp"
                    },
                    {
                        "Id": 5050,
                        "Text": "Lokaltillbehör"
                    },
                    {
                        "Id": 5060,
                        "Text": "Städning och renhållning"
                    },
                    {
                        "Id": 5061,
                        "Text": "Städning"
                    },
                    {
                        "Id": 5062,
                        "Text": "Sophämtning"
                    },
                    {
                        "Id": 5063,
                        "Text": "Hyra för sopcontainer"
                    },
                    {
                        "Id": 5064,
                        "Text": "Snöröjning"
                    },
                    {
                        "Id": 5065,
                        "Text": "Trädgårdsskötsel"
                    },
                    {
                        "Id": 5070,
                        "Text": "Reparation och underhåll av lokaler"
                    },
                    {
                        "Id": 5090,
                        "Text": "Övriga lokalkostnader"
                    },
                    {
                        "Id": 5098,
                        "Text": "Övriga lokalkostnader, avdragsgilla"
                    },
                    {
                        "Id": 5099,
                        "Text": "Övriga lokalkostnader, ej avdragsgilla"
                    }
                ]
            },
            {
                "Id": 51,
                "Text": "Fastighetskostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5100,
                        "Text": "Fastighetskostnader (gruppkonto)"
                    },
                    {
                        "Id": 5110,
                        "Text": "Tomträttsavgäld/arrende"
                    },
                    {
                        "Id": 5120,
                        "Text": "El för belysning"
                    },
                    {
                        "Id": 5130,
                        "Text": "Värme"
                    },
                    {
                        "Id": 5131,
                        "Text": "Uppvärmning"
                    },
                    {
                        "Id": 5132,
                        "Text": "Sotning"
                    },
                    {
                        "Id": 5140,
                        "Text": "Vatten och avlopp"
                    },
                    {
                        "Id": 5160,
                        "Text": "Städning och renhållning"
                    },
                    {
                        "Id": 5161,
                        "Text": "Städning"
                    },
                    {
                        "Id": 5162,
                        "Text": "Sophämtning"
                    },
                    {
                        "Id": 5163,
                        "Text": "Hyra för sopcontainer"
                    },
                    {
                        "Id": 5164,
                        "Text": "Snöröjning"
                    },
                    {
                        "Id": 5165,
                        "Text": "Trädgårdsskötsel"
                    },
                    {
                        "Id": 5170,
                        "Text": "Reparation och underhåll av fastighet"
                    },
                    {
                        "Id": 5190,
                        "Text": "Övriga fastighetskostnader"
                    },
                    {
                        "Id": 5191,
                        "Text": "Fastighetsskatt/fastighetsavgift"
                    },
                    {
                        "Id": 5192,
                        "Text": "Fastighetsförsäkringspremier"
                    },
                    {
                        "Id": 5193,
                        "Text": "Fastighetsskötsel och förvaltning"
                    },
                    {
                        "Id": 5198,
                        "Text": "Övriga fastighetskostnader, avdragsgilla"
                    },
                    {
                        "Id": 5199,
                        "Text": "Övriga fastighetskostnader, ej avdragsgilla"
                    }
                ]
            },
            {
                "Id": 52,
                "Text": "Hyra av anläggningstillgångar",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5200,
                        "Text": "Hyra av anläggningstillgångar (gruppkonto)"
                    },
                    {
                        "Id": 5210,
                        "Text": "Hyra av maskiner och andra tekniska anläggningar"
                    },
                    {
                        "Id": 5211,
                        "Text": "Korttidshyra av maskiner och andra tekniska anläggningar"
                    },
                    {
                        "Id": 5212,
                        "Text": "Leasing av maskiner och andra tekniska anläggningar"
                    },
                    {
                        "Id": 5220,
                        "Text": "Hyra av inventarier och verktyg"
                    },
                    {
                        "Id": 5221,
                        "Text": "Korttidshyra av inventarier och verktyg"
                    },
                    {
                        "Id": 5222,
                        "Text": "Leasing av inventarier och verktyg"
                    },
                    {
                        "Id": 5250,
                        "Text": "Hyra av datorer"
                    },
                    {
                        "Id": 5251,
                        "Text": "Korttidshyra av datorer"
                    },
                    {
                        "Id": 5252,
                        "Text": "Leasing av datorer"
                    },
                    {
                        "Id": 5290,
                        "Text": "Övriga hyreskostnader för anläggningstillgångar"
                    }
                ]
            },
            {
                "Id": 53,
                "Text": "Energikostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5300,
                        "Text": "Energikostnader (gruppkonto)"
                    },
                    {
                        "Id": 5310,
                        "Text": "El för drift"
                    },
                    {
                        "Id": 5320,
                        "Text": "Gas"
                    },
                    {
                        "Id": 5330,
                        "Text": "Eldningsolja"
                    },
                    {
                        "Id": 5340,
                        "Text": "Stenkol och koks"
                    },
                    {
                        "Id": 5350,
                        "Text": "Torv, träkol, ved och annat träbränsle"
                    },
                    {
                        "Id": 5360,
                        "Text": "Bensin, fotogen och motorbrännolja"
                    },
                    {
                        "Id": 5370,
                        "Text": "Fjärrvärme, kyla och ånga"
                    },
                    {
                        "Id": 5380,
                        "Text": "Vatten"
                    },
                    {
                        "Id": 5390,
                        "Text": "Övriga energikostnader"
                    }
                ]
            },
            {
                "Id": 54,
                "Text": "Förbrukningsinventarier och förbrukningsmaterial",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5400,
                        "Text": "Förbrukningsinventarier och förbrukningsmaterial (gruppkonto)"
                    },
                    {
                        "Id": 5410,
                        "Text": "Förbrukningsinventarier"
                    },
                    {
                        "Id": 5411,
                        "Text": "Förbrukningsinventarier med en livslängd på mer än ett år"
                    },
                    {
                        "Id": 5412,
                        "Text": "Förbrukningsinventarier med en livslängd på ett år eller mindre"
                    },
                    {
                        "Id": 5420,
                        "Text": "Programvaror"
                    },
                    {
                        "Id": 5430,
                        "Text": "Transportinventarier"
                    },
                    {
                        "Id": 5440,
                        "Text": "Förbrukningsemballage"
                    },
                    {
                        "Id": 5460,
                        "Text": "Förbrukningsmaterial"
                    },
                    {
                        "Id": 5480,
                        "Text": "Arbetskläder och skyddsmaterial"
                    },
                    {
                        "Id": 5490,
                        "Text": "Övriga förbrukningsinventarier och förbrukningsmaterial"
                    },
                    {
                        "Id": 5491,
                        "Text": "Övriga förbrukningsinventarier med en livslängd på mer än ett år"
                    },
                    {
                        "Id": 5492,
                        "Text": "Övriga förbrukningsinventarier med en livslängd på ett år eller mindre"
                    },
                    {
                        "Id": 5493,
                        "Text": "Övrigt förbrukningsmaterial"
                    }
                ]
            },
            {
                "Id": 55,
                "Text": "Reparation och underhåll",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5500,
                        "Text": "Reparation och underhåll (gruppkonto)"
                    },
                    {
                        "Id": 5510,
                        "Text": "Reparation och underhåll av maskiner och andra tekniska anläggningar"
                    },
                    {
                        "Id": 5520,
                        "Text": "Reparation och underhåll av inventarier, verktyg och datorer m.m."
                    },
                    {
                        "Id": 5530,
                        "Text": "Reparation och underhåll av installationer"
                    },
                    {
                        "Id": 5550,
                        "Text": "Reparation och underhåll av förbrukningsinventarier"
                    },
                    {
                        "Id": 5580,
                        "Text": "Underhåll och tvätt av arbetskläder"
                    },
                    {
                        "Id": 5590,
                        "Text": "Övriga kostnader för reparation och underhåll"
                    }
                ]
            },
            {
                "Id": 56,
                "Text": "Kostnader för transportmedel",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5600,
                        "Text": "Kostnader för transportmedel (gruppkonto)"
                    },
                    {
                        "Id": 5610,
                        "Text": "Personbilskostnader"
                    },
                    {
                        "Id": 5611,
                        "Text": "Drivmedel för personbilar"
                    },
                    {
                        "Id": 5612,
                        "Text": "Försäkring och skatt för personbilar"
                    },
                    {
                        "Id": 5613,
                        "Text": "Reparation och underhåll av personbilar"
                    },
                    {
                        "Id": 5615,
                        "Text": "Leasing av personbilar"
                    },
                    {
                        "Id": 5616,
                        "Text": "Trängselskatt, avdragsgill"
                    },
                    {
                        "Id": 5619,
                        "Text": "Övriga personbilskostnader"
                    },
                    {
                        "Id": 5620,
                        "Text": "Lastbilskostnader"
                    },
                    {
                        "Id": 5630,
                        "Text": "Truckkostnader"
                    },
                    {
                        "Id": 5640,
                        "Text": "Kostnader för arbetsmaskiner"
                    },
                    {
                        "Id": 5650,
                        "Text": "Traktorkostnader"
                    },
                    {
                        "Id": 5660,
                        "Text": "Motorcykel-, moped- och skoterkostnader"
                    },
                    {
                        "Id": 5670,
                        "Text": "Båt-, flygplans- och helikopterkostnader"
                    },
                    {
                        "Id": 5690,
                        "Text": "Övriga kostnader för transportmedel"
                    }
                ]
            },
            {
                "Id": 57,
                "Text": "Frakter och transporter",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5700,
                        "Text": "Frakter och transporter (gruppkonto)"
                    },
                    {
                        "Id": 5710,
                        "Text": "Frakter, transporter och försäkringar vid varudistribution"
                    },
                    {
                        "Id": 5720,
                        "Text": "Tull- och speditionskostnader m.m."
                    },
                    {
                        "Id": 5730,
                        "Text": "Arbetstransporter"
                    },
                    {
                        "Id": 5790,
                        "Text": "Övriga kostnader för frakter och transporter"
                    }
                ]
            },
            {
                "Id": 58,
                "Text": "Resekostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5800,
                        "Text": "Resekostnader (gruppkonto)"
                    },
                    {
                        "Id": 5810,
                        "Text": "Biljetter"
                    },
                    {
                        "Id": 5820,
                        "Text": "Hyrbilskostnader"
                    },
                    {
                        "Id": 5830,
                        "Text": "Kost och logi"
                    },
                    {
                        "Id": 5831,
                        "Text": "Kost och logi i Sverige"
                    },
                    {
                        "Id": 5832,
                        "Text": "Kost och logi i utlandet"
                    },
                    {
                        "Id": 5841,
                        "Text": "Milersättning, avdragsgill (Ägare enskild firma)"
                    },
                    {
                        "Id": 5842,
                        "Text": "Milersättning, ej avdragsgill (Ägare enskild firma)"
                    },
                    {
                        "Id": 5843,
                        "Text": "Traktamente Sverige avdragsgillt (Ägare enskild firma)"
                    },
                    {
                        "Id": 5844,
                        "Text": "Traktamente Sverige ej avdragsgillt (Ägare enskild firma)"
                    },
                    {
                        "Id": 5845,
                        "Text": "Traktamente Utlandet avdragsgillt (Ägare enskild firma)"
                    },
                    {
                        "Id": 5846,
                        "Text": "Traktamente Utlandet ej avdragsgillt (Ägare enskild firma)"
                    },
                    {
                        "Id": 5890,
                        "Text": "Övriga resekostnader"
                    }
                ]
            },
            {
                "Id": 59,
                "Text": "Reklam och PR",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 5900,
                        "Text": "Reklam och PR (gruppkonto)"
                    },
                    {
                        "Id": 5910,
                        "Text": "Annonsering"
                    },
                    {
                        "Id": 5920,
                        "Text": "Utomhus- och trafikreklam"
                    },
                    {
                        "Id": 5930,
                        "Text": "Reklamtrycksaker och direktreklam"
                    },
                    {
                        "Id": 5940,
                        "Text": "Utställningar och mässor"
                    },
                    {
                        "Id": 5950,
                        "Text": "Butiksreklam och återförsäljarreklam"
                    },
                    {
                        "Id": 5960,
                        "Text": "Varuprover, reklamgåvor, presentreklam och tävlingar"
                    },
                    {
                        "Id": 5970,
                        "Text": "Film-, radio-, TV- och Internetreklam"
                    },
                    {
                        "Id": 5980,
                        "Text": "PR, institutionell reklam och sponsring"
                    },
                    {
                        "Id": 5990,
                        "Text": "Övriga kostnader för reklam och PR"
                    }
                ]
            }
        ]
    },
    {
        "Id": 6,
        "Text": "Övriga externa rörelseutgifter/ kostnader",
        "SubCategories": [
            {
                "Id": 60,
                "Text": "Övriga försäljningskostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 6000,
                        "Text": "Övriga försäljningskostnader (gruppkonto)"
                    },
                    {
                        "Id": 6010,
                        "Text": "Kataloger, prislistor m.m."
                    },
                    {
                        "Id": 6020,
                        "Text": "Egna facktidskrifter"
                    },
                    {
                        "Id": 6030,
                        "Text": "Speciella orderkostnader"
                    },
                    {
                        "Id": 6040,
                        "Text": "Kontokortsavgifter"
                    },
                    {
                        "Id": 6050,
                        "Text": "Försäljningsprovisioner"
                    },
                    {
                        "Id": 6055,
                        "Text": "Franchisekostnader o.dyl."
                    },
                    {
                        "Id": 6060,
                        "Text": "Kreditförsäljningskostnader"
                    },
                    {
                        "Id": 6061,
                        "Text": "Kreditupplysning"
                    },
                    {
                        "Id": 6062,
                        "Text": "Inkasso och KFM-avgifter"
                    },
                    {
                        "Id": 6063,
                        "Text": "Kreditförsäkringspremier"
                    },
                    {
                        "Id": 6064,
                        "Text": "Factoringavgifter"
                    },
                    {
                        "Id": 6069,
                        "Text": "Övriga kreditförsäljningskostnader"
                    },
                    {
                        "Id": 6070,
                        "Text": "Representation"
                    },
                    {
                        "Id": 6071,
                        "Text": "Representation, avdragsgill"
                    },
                    {
                        "Id": 6072,
                        "Text": "Representation, ej avdragsgill"
                    },
                    {
                        "Id": 6080,
                        "Text": "Bankgarantier"
                    },
                    {
                        "Id": 6090,
                        "Text": "Övriga försäljningskostnader"
                    }
                ]
            },
            {
                "Id": 61,
                "Text": "Kontorsmateriel och trycksaker",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 6100,
                        "Text": "Kontorsmateriel och trycksaker (gruppkonto)"
                    },
                    {
                        "Id": 6110,
                        "Text": "Kontorsmateriel"
                    },
                    {
                        "Id": 6150,
                        "Text": "Trycksaker"
                    }
                ]
            },
            {
                "Id": 62,
                "Text": "Tele och post",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 6200,
                        "Text": "Tele och post (gruppkonto)"
                    },
                    {
                        "Id": 6210,
                        "Text": "Telekommunikation"
                    },
                    {
                        "Id": 6211,
                        "Text": "Fast telefoni"
                    },
                    {
                        "Id": 6212,
                        "Text": "Mobiltelefon"
                    },
                    {
                        "Id": 6213,
                        "Text": "Mobilsökning"
                    },
                    {
                        "Id": 6214,
                        "Text": "Fax"
                    },
                    {
                        "Id": 6215,
                        "Text": "Telex"
                    },
                    {
                        "Id": 6230,
                        "Text": "Datakommunikation"
                    },
                    {
                        "Id": 6250,
                        "Text": "Postbefordran"
                    }
                ]
            },
            {
                "Id": 63,
                "Text": "Företagsförsäkringar och övriga riskkostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 6300,
                        "Text": "Företagsförsäkringar och övriga riskkostnader (gruppkonto)"
                    },
                    {
                        "Id": 6310,
                        "Text": "Företagsförsäkringar"
                    },
                    {
                        "Id": 6320,
                        "Text": "Självrisker vid skada"
                    },
                    {
                        "Id": 6330,
                        "Text": "Förluster i pågående arbeten"
                    },
                    {
                        "Id": 6340,
                        "Text": "Lämnade skadestånd"
                    },
                    {
                        "Id": 6341,
                        "Text": "Lämnade skadestånd, avdragsgilla"
                    },
                    {
                        "Id": 6342,
                        "Text": "Lämnade skadestånd, ej avdragsgilla"
                    },
                    {
                        "Id": 6350,
                        "Text": "Förluster på kundfordringar"
                    },
                    {
                        "Id": 6351,
                        "Text": "Konstaterade förluster på kundfordringar"
                    },
                    {
                        "Id": 6352,
                        "Text": "Befarade förluster på kundfordringar"
                    },
                    {
                        "Id": 6360,
                        "Text": "Garantikostnader"
                    },
                    {
                        "Id": 6361,
                        "Text": "Förändring av garantiavsättning"
                    },
                    {
                        "Id": 6362,
                        "Text": "Faktiska garantikostnader"
                    },
                    {
                        "Id": 6370,
                        "Text": "Kostnader för bevakning och larm"
                    },
                    {
                        "Id": 6380,
                        "Text": "Förluster på övriga kortfristiga fordringar"
                    },
                    {
                        "Id": 6390,
                        "Text": "Övriga riskkostnader"
                    }
                ]
            },
            {
                "Id": 64,
                "Text": "Förvaltningskostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 6400,
                        "Text": "Förvaltningskostnader (gruppkonto)"
                    },
                    {
                        "Id": 6410,
                        "Text": "Styrelsearvoden som inte är lön"
                    },
                    {
                        "Id": 6420,
                        "Text": "Ersättningar till revisor"
                    },
                    {
                        "Id": 6421,
                        "Text": "Revision"
                    },
                    {
                        "Id": 6422,
                        "Text": "Revisonsverksamhet utöver revision"
                    },
                    {
                        "Id": 6423,
                        "Text": "Skatterådgivning – revisor"
                    },
                    {
                        "Id": 6424,
                        "Text": "Övriga tjänster – revisor"
                    },
                    {
                        "Id": 6430,
                        "Text": "Management fees"
                    },
                    {
                        "Id": 6440,
                        "Text": "Årsredovisning och delårsrapporter"
                    },
                    {
                        "Id": 6450,
                        "Text": "Bolagsstämma/års- eller föreningsstämma"
                    },
                    {
                        "Id": 6490,
                        "Text": "Övriga förvaltningskostnader"
                    }
                ]
            },
            {
                "Id": 65,
                "Text": "Övriga externa tjänster",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 6500,
                        "Text": "Övriga externa tjänster (gruppkonto)"
                    },
                    {
                        "Id": 6510,
                        "Text": "Mätningskostnader"
                    },
                    {
                        "Id": 6520,
                        "Text": "Ritnings- och kopieringskostnader"
                    },
                    {
                        "Id": 6530,
                        "Text": "Redovisningstjänster"
                    },
                    {
                        "Id": 6540,
                        "Text": "IT-tjänster"
                    },
                    {
                        "Id": 6550,
                        "Text": "Konsultarvoden"
                    },
                    {
                        "Id": 6560,
                        "Text": "Serviceavgifter till branschorganisationer"
                    },
                    {
                        "Id": 6570,
                        "Text": "Bankkostnader"
                    },
                    {
                        "Id": 6580,
                        "Text": "Advokat- och rättegångskostnader"
                    },
                    {
                        "Id": 6590,
                        "Text": "Övriga externa tjänster"
                    }
                ]
            },
            {
                "Id": 68,
                "Text": "Inhyrd personal",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 6800,
                        "Text": "Inhyrd personal (gruppkonto)"
                    },
                    {
                        "Id": 6810,
                        "Text": "Inhyrd produktionspersonal"
                    },
                    {
                        "Id": 6820,
                        "Text": "Inhyrd lagerpersonal"
                    },
                    {
                        "Id": 6830,
                        "Text": "Inhyrd transportpersonal"
                    },
                    {
                        "Id": 6840,
                        "Text": "Inhyrd kontors- och ekonomipersonal"
                    },
                    {
                        "Id": 6850,
                        "Text": "Inhyrd IT-personal"
                    },
                    {
                        "Id": 6860,
                        "Text": "Inhyrd marknads- och försäljningspersonal"
                    },
                    {
                        "Id": 6870,
                        "Text": "Inhyrd restaurang- och butikspersonal"
                    },
                    {
                        "Id": 6880,
                        "Text": "Inhyrda företagsledare"
                    },
                    {
                        "Id": 6890,
                        "Text": "Övrig inhyrd personal"
                    }
                ]
            },
            {
                "Id": 69,
                "Text": "Övriga externa kostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 6900,
                        "Text": "Övriga externa kostnader (gruppkonto)"
                    },
                    {
                        "Id": 6910,
                        "Text": "Licensavgifter och royalties"
                    },
                    {
                        "Id": 6920,
                        "Text": "Kostnader för egna patent"
                    },
                    {
                        "Id": 6930,
                        "Text": "Kostnader för varumärken m.m."
                    },
                    {
                        "Id": 6940,
                        "Text": "Kontroll-, provnings- och stämpelavgifter"
                    },
                    {
                        "Id": 6950,
                        "Text": "Tillsynsavgifter myndigheter"
                    },
                    {
                        "Id": 6970,
                        "Text": "Tidningar, tidskrifter och facklitteratur"
                    },
                    {
                        "Id": 6980,
                        "Text": "Föreningsavgifter"
                    },
                    {
                        "Id": 6981,
                        "Text": "Föreningsavgifter, avdragsgilla"
                    },
                    {
                        "Id": 6982,
                        "Text": "Föreningsavgifter, ej avdragsgilla"
                    },
                    {
                        "Id": 6990,
                        "Text": "Övriga externa kostnader"
                    },
                    {
                        "Id": 6991,
                        "Text": "Övriga externa kostnader, avdragsgilla"
                    },
                    {
                        "Id": 6992,
                        "Text": "Övriga externa kostnader, ej avdragsgilla"
                    },
                    {
                        "Id": 6993,
                        "Text": "Lämnade bidrag och gåvor"
                    },
                    {
                        "Id": 6996,
                        "Text": "Betald utländsk inkomstskatt"
                    },
                    {
                        "Id": 6997,
                        "Text": "Obetald utländsk inkomstskatt"
                    },
                    {
                        "Id": 6998,
                        "Text": "Utländsk moms"
                    },
                    {
                        "Id": 6999,
                        "Text": "Ingående moms, blandad verksamhet"
                    }
                ]
            }
        ]
    },
    {
        "Id": 7,
        "Text": "Utgifter/kostnader för personal, avskrivningar m.m.",
        "SubCategories": [
            {
                "Id": 70,
                "Text": "Löner till kollektivanställda",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 7000,
                        "Text": "Löner till kollektivanställda (gruppkonto)"
                    },
                    {
                        "Id": 7010,
                        "Text": "Löner till kollektivanställda"
                    },
                    {
                        "Id": 7011,
                        "Text": "Löner till kollektivanställda"
                    },
                    {
                        "Id": 7012,
                        "Text": "Vinstandelar till kollektivanställda"
                    },
                    {
                        "Id": 7013,
                        "Text": "Löner till kollektivanställda under 26 år"
                    },
                    {
                        "Id": 7014,
                        "Text": "Löner till kollektivanställda (nya pensionssystemet)"
                    },
                    {
                        "Id": 7015,
                        "Text": "Löner till kollektivanställda (avgiftsbefriade)"
                    },
                    {
                        "Id": 7016,
                        "Text": "Vinstandelar till kollektivanställda (avgiftsbefriade)"
                    },
                    {
                        "Id": 7017,
                        "Text": "Avgångsvederlag till kollektivanställda"
                    },
                    {
                        "Id": 7018,
                        "Text": "Bruttolöneavdrag, kollektivanställda"
                    },
                    {
                        "Id": 7019,
                        "Text": "Upplupna löner och vinstandelar till kollektivanställda"
                    },
                    {
                        "Id": 7030,
                        "Text": "Löner till kollektivanställda (utlandsanställda)"
                    },
                    {
                        "Id": 7031,
                        "Text": "Löner till kollektivanställda (utlandsanställda)"
                    },
                    {
                        "Id": 7032,
                        "Text": "Vinstandelar till kollektivanställda (utlandsanställda)"
                    },
                    {
                        "Id": 7033,
                        "Text": "Löner till kollektivanställda under 26 år (utlandsanställda)"
                    },
                    {
                        "Id": 7034,
                        "Text": "Löner till kollektivanställda (nya pensionssystemet) (utlandsanställda)"
                    },
                    {
                        "Id": 7035,
                        "Text": "Löner till kollektivanställda (avgiftsbefriade) (utlandsanställda)"
                    },
                    {
                        "Id": 7036,
                        "Text": "Vinstandelar till kollektivanställda (avgiftsbefriade) (utlandsanställda)"
                    },
                    {
                        "Id": 7037,
                        "Text": "Avgångsvederlag till kollektivanställda (utlandsanställda)"
                    },
                    {
                        "Id": 7038,
                        "Text": "Bruttolöneavdrag, kollektivanställda (utlandsanställda)"
                    },
                    {
                        "Id": 7039,
                        "Text": "Upplupna löner och vinstandelar till kollektivanställda (utlandsanställda)"
                    },
                    {
                        "Id": 7080,
                        "Text": "Löner till kollektivanställda för ej arbetad tid"
                    },
                    {
                        "Id": 7081,
                        "Text": "Sjuklöner till kollektivanställda"
                    },
                    {
                        "Id": 7082,
                        "Text": "Semesterlöner till kollektivanställda"
                    },
                    {
                        "Id": 7083,
                        "Text": "Föräldraersättning till kollektivanställda"
                    },
                    {
                        "Id": 7090,
                        "Text": "Förändring av semesterlöneskuld"
                    }
                ]
            },
            {
                "Id": 72,
                "Text": "Löner till tjänstemän och företagsledare",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 7200,
                        "Text": "Löner till tjänstemän och företagsledare (gruppkonto)"
                    },
                    {
                        "Id": 7210,
                        "Text": "Löner till tjänstemän"
                    },
                    {
                        "Id": 7211,
                        "Text": "Löner till tjänstemän"
                    },
                    {
                        "Id": 7212,
                        "Text": "Vinstandelar till tjänstemän"
                    },
                    {
                        "Id": 7213,
                        "Text": "Löner till tjänstemän under 26 år"
                    },
                    {
                        "Id": 7214,
                        "Text": "Löner till tjänstemän (nya pensionssystemet)"
                    },
                    {
                        "Id": 7215,
                        "Text": "Löner till tjänstemän (avgiftsbefriade)"
                    },
                    {
                        "Id": 7216,
                        "Text": "Vinstandelar till tjänstemän (avgiftsbefriade)"
                    },
                    {
                        "Id": 7217,
                        "Text": "Avgångsvederlag till tjänstemän"
                    },
                    {
                        "Id": 7218,
                        "Text": "Bruttolöneavdrag, tjänstemän"
                    },
                    {
                        "Id": 7219,
                        "Text": "Upplupna löner och vinstandelar till tjänstemän"
                    },
                    {
                        "Id": 7220,
                        "Text": "Löner till företagsledare"
                    },
                    {
                        "Id": 7221,
                        "Text": "Löner till företagsledare"
                    },
                    {
                        "Id": 7222,
                        "Text": "Tantiem till företagsledare"
                    },
                    {
                        "Id": 7223,
                        "Text": "Löner till företagsledare under 26 år"
                    },
                    {
                        "Id": 7224,
                        "Text": "Löner till företagsledare (nya pensionssystemet)"
                    },
                    {
                        "Id": 7225,
                        "Text": "Löner till företagsledare (avgiftsbefriade)"
                    },
                    {
                        "Id": 7227,
                        "Text": "Avgångsvederlag till företagsledare"
                    },
                    {
                        "Id": 7228,
                        "Text": "Bruttolöneavdrag, företagsledare"
                    },
                    {
                        "Id": 7229,
                        "Text": "Upplupna löner och tantiem till företagsledare"
                    },
                    {
                        "Id": 7230,
                        "Text": "Löner till tjänstemän och ftgsledare (utlandsanställda)"
                    },
                    {
                        "Id": 7231,
                        "Text": "Löner till tjänstemän och ftgsledare (utlandsanställda)"
                    },
                    {
                        "Id": 7232,
                        "Text": "Vinstandelar till tjänstemän och ftgsledare (utlandsanställda)"
                    },
                    {
                        "Id": 7233,
                        "Text": "Löner till tjänstemän och ftgsledare under 26 år (utlandsanställda)"
                    },
                    {
                        "Id": 7234,
                        "Text": "Löner till tjänstemän och ftgsledare (utlandsanställda) (nya pensionssystemet)"
                    },
                    {
                        "Id": 7235,
                        "Text": "Löner till tjänstemän och ftgsledare (utlandsanställda) (avgiftsbefriade)"
                    },
                    {
                        "Id": 7236,
                        "Text": "Vinstandelar till tjänstemän och ftgsledare (utlandsanställda) (avgiftsbefriade)"
                    },
                    {
                        "Id": 7237,
                        "Text": "Avgångsvederlag till tjänstemän och ftgsledare (utlandsanställda)"
                    },
                    {
                        "Id": 7238,
                        "Text": "Bruttolöneavdrag, tjänstemän och ftgsledare (utlandsanställda)"
                    },
                    {
                        "Id": 7239,
                        "Text": "Upplupna löner och vinstandelar till tjänstemän och ftgsledare (utlandsanställda)"
                    },
                    {
                        "Id": 7240,
                        "Text": "Styrelsearvoden"
                    },
                    {
                        "Id": 7280,
                        "Text": "Löner till tjänstemän och företagsledare för ej arbetad tid"
                    },
                    {
                        "Id": 7281,
                        "Text": "Sjuklöner till tjänstemän"
                    },
                    {
                        "Id": 7282,
                        "Text": "Sjuklöner till företagsledare"
                    },
                    {
                        "Id": 7283,
                        "Text": "Föräldraersättning till tjänstemän"
                    },
                    {
                        "Id": 7284,
                        "Text": "Föräldraersättning till företagsledare"
                    },
                    {
                        "Id": 7285,
                        "Text": "Semesterlöner till tjänstemän"
                    },
                    {
                        "Id": 7286,
                        "Text": "Semesterlöner till företagsledare"
                    },
                    {
                        "Id": 7288,
                        "Text": "Övriga löner till tjänstemän för ej arbetad tid"
                    },
                    {
                        "Id": 7289,
                        "Text": "Övriga löner till företagsledare för ej arbetad tid"
                    },
                    {
                        "Id": 7290,
                        "Text": "Förändring av semesterlöneskuld"
                    },
                    {
                        "Id": 7291,
                        "Text": "Förändring av semesterlöneskuld till tjänstemän"
                    },
                    {
                        "Id": 7292,
                        "Text": "Förändring av semesterlöneskuld till företagsledare"
                    }
                ]
            },
            {
                "Id": 73,
                "Text": "Kostnadsersättningar och förmåner",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 7300,
                        "Text": "Kostnadsersättningar och förmåner (gruppkonto)"
                    },
                    {
                        "Id": 7310,
                        "Text": "Kontanta extraersättningar"
                    },
                    {
                        "Id": 7311,
                        "Text": "Ersättningar för sammanträden m.m."
                    },
                    {
                        "Id": 7312,
                        "Text": "Ersättningar för förslagsverksamhet och uppfinningar"
                    },
                    {
                        "Id": 7313,
                        "Text": "Ersättningar för/bidrag till bostadskostnader"
                    },
                    {
                        "Id": 7314,
                        "Text": "Ersättningar för/bidrag till måltidskostnader"
                    },
                    {
                        "Id": 7315,
                        "Text": "Ersättningar för/bidrag till resor till och från arbetsplatsen"
                    },
                    {
                        "Id": 7316,
                        "Text": "Ersättningar för/bidrag till arbetskläder"
                    },
                    {
                        "Id": 7317,
                        "Text": "Ersättningar för/bidrag till arbetsmaterial och arbetsverktyg"
                    },
                    {
                        "Id": 7318,
                        "Text": "Felräkningspengar"
                    },
                    {
                        "Id": 7319,
                        "Text": "Övriga kontanta extraersättningar"
                    },
                    {
                        "Id": 7320,
                        "Text": "Traktamenten vid tjänsteresa"
                    },
                    {
                        "Id": 7321,
                        "Text": "Skattefria traktamenten, Sverige"
                    },
                    {
                        "Id": 7322,
                        "Text": "Skattepliktiga traktamenten, Sverige"
                    },
                    {
                        "Id": 7323,
                        "Text": "Skattefria traktamenten, utlandet"
                    },
                    {
                        "Id": 7324,
                        "Text": "Skattepliktiga traktamenten, utlandet"
                    },
                    {
                        "Id": 7330,
                        "Text": "Bilersättningar"
                    },
                    {
                        "Id": 7331,
                        "Text": "Skattefria bilersättningar"
                    },
                    {
                        "Id": 7332,
                        "Text": "Skattepliktiga bilersättningar"
                    },
                    {
                        "Id": 7333,
                        "Text": "Ersättning för trängselskatt, skattefri"
                    },
                    {
                        "Id": 7350,
                        "Text": "Ersättningar för föreskrivna arbetskläder"
                    },
                    {
                        "Id": 7370,
                        "Text": "Representationsersättningar"
                    },
                    {
                        "Id": 7380,
                        "Text": "Kostnader för förmåner till anställda"
                    },
                    {
                        "Id": 7381,
                        "Text": "Kostnader för fri bostad"
                    },
                    {
                        "Id": 7382,
                        "Text": "Kostnader för fria eller subventionerade måltider"
                    },
                    {
                        "Id": 7383,
                        "Text": "Kostnader för fria resor till och från arbetsplatsen"
                    },
                    {
                        "Id": 7384,
                        "Text": "Kostnader för fria eller subventionerade arbetskläder"
                    },
                    {
                        "Id": 7385,
                        "Text": "Kostnader för fri bil"
                    },
                    {
                        "Id": 7386,
                        "Text": "Subventionerad ränta"
                    },
                    {
                        "Id": 7387,
                        "Text": "Kostnader för lånedatorer"
                    },
                    {
                        "Id": 7388,
                        "Text": "Anställdas ersättning för erhållna förmåner"
                    },
                    {
                        "Id": 7389,
                        "Text": "Övriga kostnader för förmåner"
                    },
                    {
                        "Id": 7390,
                        "Text": "Övriga kostnadsersättningar och förmåner"
                    },
                    {
                        "Id": 7391,
                        "Text": "Kostnad för trängselskatteförmån"
                    },
                    {
                        "Id": 7392,
                        "Text": "Kostnad för förmån av hushållsnära tjänster"
                    },
                    {
                        "Id": 7399,
                        "Text": "Motkonto skattepliktiga förmåner"
                    }
                ]
            },
            {
                "Id": 74,
                "Text": "Pensionskostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 7400,
                        "Text": "Pensionskostnader (gruppkonto)"
                    },
                    {
                        "Id": 7410,
                        "Text": "Pensionsförsäkringspremier"
                    },
                    {
                        "Id": 7411,
                        "Text": "Premier för kollektiva pensionsförsäkringar"
                    },
                    {
                        "Id": 7412,
                        "Text": "Premier för individuella pensionsförsäkringar"
                    },
                    {
                        "Id": 7418,
                        "Text": "Återbäring från försäkringsföretag"
                    },
                    {
                        "Id": 7420,
                        "Text": "Förändring av pensionsskuld"
                    },
                    {
                        "Id": 7421,
                        "Text": "Direktpension, ej avdragsgill"
                    },
                    {
                        "Id": 7430,
                        "Text": "Avdrag för räntedel i pensionskostnad"
                    },
                    {
                        "Id": 7440,
                        "Text": "Förändring av pensionsstiftelsekapital"
                    },
                    {
                        "Id": 7441,
                        "Text": "Avsättning till pensionsstiftelse"
                    },
                    {
                        "Id": 7448,
                        "Text": "Gottgörelse från pensionsstiftelse"
                    },
                    {
                        "Id": 7460,
                        "Text": "Pensionsutbetalningar"
                    },
                    {
                        "Id": 7461,
                        "Text": "Pensionsutbetalningar till f.d. kollektivanställda"
                    },
                    {
                        "Id": 7462,
                        "Text": "Pensionsutbetalningar till f.d. tjänstemän"
                    },
                    {
                        "Id": 7463,
                        "Text": "Pensionsutbetalningar till f.d. företagsledare"
                    },
                    {
                        "Id": 7470,
                        "Text": "Förvaltnings- och kreditförsäkringsavgifter"
                    },
                    {
                        "Id": 7490,
                        "Text": "Övriga pensionskostnader"
                    }
                ]
            },
            {
                "Id": 75,
                "Text": "Sociala och andra avgifter enligt lag och avtal",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 7500,
                        "Text": "Sociala och andra avgifter enligt lag och avtal (gruppkonto)"
                    },
                    {
                        "Id": 7510,
                        "Text": "Lagstadgade sociala avgifter"
                    },
                    {
                        "Id": 7511,
                        "Text": "Sociala avgifter för löner och ersättningar"
                    },
                    {
                        "Id": 7512,
                        "Text": "Sociala avgifter för förmånsvärden"
                    },
                    {
                        "Id": 7515,
                        "Text": "Sociala avgifter på skattepliktiga kostnadsersättningar"
                    },
                    {
                        "Id": 7516,
                        "Text": "Sociala avgifter på arvoden"
                    },
                    {
                        "Id": 7518,
                        "Text": "Sociala avgifter på bruttolöneavdrag m.m."
                    },
                    {
                        "Id": 7519,
                        "Text": "Sociala avgifter för semester- och löneskulder"
                    },
                    {
                        "Id": 7520,
                        "Text": "Arbetsgivaravgifter (nya pensionssystemet)"
                    },
                    {
                        "Id": 7521,
                        "Text": "Arbetsgivaravgifter för löner och ersättningar (nya pensionssystemet)"
                    },
                    {
                        "Id": 7522,
                        "Text": "Arbetsgivaravgifter för förmånsvärden (nya pensionssystemet)"
                    },
                    {
                        "Id": 7525,
                        "Text": "Arbetsgivaravgifter på skattepliktiga kostnadsersättningar (nya pensionssystemet)"
                    },
                    {
                        "Id": 7526,
                        "Text": "Arbetsgivaravgifter på arvoden (nya pensionssystemet)"
                    },
                    {
                        "Id": 7528,
                        "Text": "Arbetsgivaravgifter på bruttolöneavdrag m.m. (nya pensionssystemet)"
                    },
                    {
                        "Id": 7529,
                        "Text": "Arbetsgivaravgifter för semester- och löneskulder (nya pensionssystemet)"
                    },
                    {
                        "Id": 7530,
                        "Text": "Särskild löneskatt"
                    },
                    {
                        "Id": 7531,
                        "Text": "Särskild löneskatt för vissa försäkringsersättningar m.m."
                    },
                    {
                        "Id": 7532,
                        "Text": "Särskild löneskatt pensionskostnader, deklarationspost"
                    },
                    {
                        "Id": 7533,
                        "Text": "Särskild löneskatt för pensionskostnader"
                    },
                    {
                        "Id": 7550,
                        "Text": "Avkastningsskatt på pensionsmedel"
                    },
                    {
                        "Id": 7560,
                        "Text": "Arbetsgivaravgifter under 26 år"
                    },
                    {
                        "Id": 7570,
                        "Text": "Premier för arbetsmarknadsförsäkringar"
                    },
                    {
                        "Id": 7571,
                        "Text": "Arbetsmarknadsförsäkringar"
                    },
                    {
                        "Id": 7572,
                        "Text": "Arbetsmarknadsförsäkringar pensionsförsäkringspremier, deklarationspost"
                    },
                    {
                        "Id": 7580,
                        "Text": "Gruppförsäkringspremier"
                    },
                    {
                        "Id": 7581,
                        "Text": "Grupplivförsäkringspremier"
                    },
                    {
                        "Id": 7582,
                        "Text": "Gruppsjukförsäkringspremier"
                    },
                    {
                        "Id": 7583,
                        "Text": "Gruppolycksfallsförsäkringspremier"
                    },
                    {
                        "Id": 7589,
                        "Text": "Övriga gruppförsäkringspremier"
                    },
                    {
                        "Id": 7590,
                        "Text": "Övriga sociala och andra avgifter enligt lag och avtal"
                    }
                ]
            },
            {
                "Id": 76,
                "Text": "Övriga personalkostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 7600,
                        "Text": "Övriga personalkostnader (gruppkonto)"
                    },
                    {
                        "Id": 7610,
                        "Text": "Utbildning"
                    },
                    {
                        "Id": 7620,
                        "Text": "Sjuk- och hälsovård"
                    },
                    {
                        "Id": 7621,
                        "Text": "Sjuk- och hälsovård, avdragsgill"
                    },
                    {
                        "Id": 7622,
                        "Text": "Sjuk- och hälsovård, ej avdragsgill"
                    },
                    {
                        "Id": 7623,
                        "Text": "Sjukvårdsförsäkring, ej avdragsgill"
                    },
                    {
                        "Id": 7630,
                        "Text": "Personalrepresentation"
                    },
                    {
                        "Id": 7631,
                        "Text": "Personalrepresentation, avdragsgill"
                    },
                    {
                        "Id": 7632,
                        "Text": "Personalrepresentation, ej avdragsgill"
                    },
                    {
                        "Id": 7650,
                        "Text": "Sjuklöneförsäkring"
                    },
                    {
                        "Id": 7670,
                        "Text": "Förändring av personalstiftelsekapital"
                    },
                    {
                        "Id": 7671,
                        "Text": "Avsättning till personalstiftelse"
                    },
                    {
                        "Id": 7678,
                        "Text": "Gottgörelse från personalstiftelse"
                    },
                    {
                        "Id": 7690,
                        "Text": "Övriga personalkostnader"
                    },
                    {
                        "Id": 7691,
                        "Text": "Personalrekrytering"
                    },
                    {
                        "Id": 7692,
                        "Text": "Begravningshjälp"
                    },
                    {
                        "Id": 7693,
                        "Text": "Fritidsverksamhet"
                    },
                    {
                        "Id": 7699,
                        "Text": "Övriga personalkostnader"
                    }
                ]
            },
            {
                "Id": 77,
                "Text": "Nedskrivningar och återföring av nedskrivningar",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 7710,
                        "Text": "Nedskrivningar av immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 7720,
                        "Text": "Nedskrivningar av byggnader och mark"
                    },
                    {
                        "Id": 7730,
                        "Text": "Nedskrivningar av maskiner och inventarier"
                    },
                    {
                        "Id": 7740,
                        "Text": "Nedskrivningar av vissa omsättningstillgångar"
                    },
                    {
                        "Id": 7760,
                        "Text": "Återföring av nedskrivningar av immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 7770,
                        "Text": "Återföring av nedskrivningar av byggnader och mark"
                    },
                    {
                        "Id": 7780,
                        "Text": "Återföring av nedskrivningar av maskiner och inventarier"
                    },
                    {
                        "Id": 7790,
                        "Text": "Återföring av nedskrivningar av vissa omsättningstillgångar"
                    }
                ]
            },
            {
                "Id": 78,
                "Text": "Avskrivningar enligt plan",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 7810,
                        "Text": "Avskrivningar på immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 7811,
                        "Text": "Avskrivningar på balanserade utgifter"
                    },
                    {
                        "Id": 7812,
                        "Text": "Avskrivningar på koncessioner m.m."
                    },
                    {
                        "Id": 7813,
                        "Text": "Avskrivningar på patent"
                    },
                    {
                        "Id": 7814,
                        "Text": "Avskrivningar på licenser"
                    },
                    {
                        "Id": 7815,
                        "Text": "Avskrivningar på varumärken"
                    },
                    {
                        "Id": 7816,
                        "Text": "Avskrivningar på hyresrätter"
                    },
                    {
                        "Id": 7817,
                        "Text": "Avskrivningar på goodwill"
                    },
                    {
                        "Id": 7819,
                        "Text": "Avskrivningar på övriga immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 7820,
                        "Text": "Avskrivningar på byggnader och markanläggningar"
                    },
                    {
                        "Id": 7821,
                        "Text": "Avskrivningar på byggnader"
                    },
                    {
                        "Id": 7824,
                        "Text": "Avskrivningar på markanläggningar"
                    },
                    {
                        "Id": 7829,
                        "Text": "Avskrivningar på övriga byggnader"
                    },
                    {
                        "Id": 7830,
                        "Text": "Avskrivningar på maskiner och inventarier"
                    },
                    {
                        "Id": 7831,
                        "Text": "Avskrivningar på maskiner och andra tekniska anläggningar"
                    },
                    {
                        "Id": 7832,
                        "Text": "Avskrivningar på inventarier och verktyg"
                    },
                    {
                        "Id": 7833,
                        "Text": "Avskrivningar på installationer"
                    },
                    {
                        "Id": 7834,
                        "Text": "Avskrivningar på bilar och andra transportmedel"
                    },
                    {
                        "Id": 7835,
                        "Text": "Avskrivningar på datorer"
                    },
                    {
                        "Id": 7836,
                        "Text": "Avskrivningar på leasade tillgångar"
                    },
                    {
                        "Id": 7839,
                        "Text": "Avskrivningar på övriga maskiner och inventarier"
                    },
                    {
                        "Id": 7840,
                        "Text": "Avskrivningar på förbättringsutgifter på annans fastighet"
                    }
                ]
            },
            {
                "Id": 79,
                "Text": "Övriga rörelsekostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 7940,
                        "Text": "Orealiserade positiva/negativa värdeförändringar på säkringsinstrument"
                    },
                    {
                        "Id": 7960,
                        "Text": "Valutakursförluster på fordringar och skulder av rörelsekaraktär"
                    },
                    {
                        "Id": 7970,
                        "Text": "Förlust vid avyttring av immateriella och materiella anläggningstillgångar"
                    },
                    {
                        "Id": 7971,
                        "Text": "Förlust vid avyttring av immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 7972,
                        "Text": "Förlust vid avyttring av byggnader och mark"
                    },
                    {
                        "Id": 7973,
                        "Text": "Förlust vid avyttring av maskiner och inventarier"
                    },
                    {
                        "Id": 7990,
                        "Text": "Övriga rörelsekostnader"
                    }
                ]
            }
        ]
    },
    {
        "Id": 8,
        "Text": "Finansiella och andra inkomster/ intäkter och utgifter/kostnader",
        "SubCategories": [
            {
                "Id": 80,
                "Text": "Resultat från andelar i koncernföretag",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 8010,
                        "Text": "Utdelning på andelar i koncernföretag"
                    },
                    {
                        "Id": 8012,
                        "Text": "Utdelning på andelar i dotterföretag"
                    },
                    {
                        "Id": 8013,
                        "Text": "Utdelning på andelar i andra koncernföretag"
                    },
                    {
                        "Id": 8014,
                        "Text": "Koncernbidrag"
                    },
                    {
                        "Id": 8016,
                        "Text": "Insatsemission, koncernföretag"
                    },
                    {
                        "Id": 8019,
                        "Text": "Övriga utdelningar på andelar i koncernföretag"
                    },
                    {
                        "Id": 8020,
                        "Text": "Resultat vid försäljning av andelar i koncernföretag"
                    },
                    {
                        "Id": 8022,
                        "Text": "Resultat vid försäljning av andelar i dotterföretag"
                    },
                    {
                        "Id": 8023,
                        "Text": "Resultat vid försäljning av andelar i andra koncernföretag"
                    },
                    {
                        "Id": 8030,
                        "Text": "Resultatandelar från handelsbolag (dotterföretag)"
                    },
                    {
                        "Id": 8070,
                        "Text": "Nedskrivningar av andelar i och långfristiga fordringar hos koncernföretag"
                    },
                    {
                        "Id": 8072,
                        "Text": "Nedskrivningar av andelar i dotterföretag"
                    },
                    {
                        "Id": 8073,
                        "Text": "Nedskrivningar av andelar i andra koncernföretag"
                    },
                    {
                        "Id": 8076,
                        "Text": "Nedskrivningar av långfristiga fordringar hos moderföretag"
                    },
                    {
                        "Id": 8077,
                        "Text": "Nedskrivningar av långfristiga fordringar hos dotterföretag"
                    },
                    {
                        "Id": 8078,
                        "Text": "Nedskrivningar av långfristiga fordringar hos andra koncernföretag"
                    },
                    {
                        "Id": 8080,
                        "Text": "Återföringar av nedskrivningar av andelar i och långfristiga fordringar hos koncernföretag"
                    },
                    {
                        "Id": 8082,
                        "Text": "Återföringar av nedskrivningar av andelar i dotterföretag"
                    },
                    {
                        "Id": 8083,
                        "Text": "Återföringar av nedskrivningar av andelar i andra koncernföretag"
                    },
                    {
                        "Id": 8086,
                        "Text": "Återföringar av nedskrivningar av långfristiga fordringar hos moderföretag"
                    },
                    {
                        "Id": 8087,
                        "Text": "Återföringar av nedskrivningar av långfristiga fordringar hos dotterföretag"
                    },
                    {
                        "Id": 8088,
                        "Text": "Återföringar av nedskrivningar av långfristiga fordringar hos andra koncernföretag"
                    }
                ]
            },
            {
                "Id": 81,
                "Text": "Resultat från andelar i intresseföretag",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 8110,
                        "Text": "Utdelning på andelar i intresseföretag"
                    },
                    {
                        "Id": 8112,
                        "Text": "Utdelningar från intresseföretag"
                    },
                    {
                        "Id": 8116,
                        "Text": "Insatsemission, intresseföretag"
                    },
                    {
                        "Id": 8120,
                        "Text": "Resultat vid försäljning av andelar i intresseföretag"
                    },
                    {
                        "Id": 8130,
                        "Text": "Resultatandelar från handelsbolag (intresseföretag)"
                    },
                    {
                        "Id": 8170,
                        "Text": "Nedskrivningar av andelar i och långfristiga fordringar hos intresseföretag"
                    },
                    {
                        "Id": 8171,
                        "Text": "Nedskrivningar av andelar i intresseföretag"
                    },
                    {
                        "Id": 8172,
                        "Text": "Nedskrivningar av långfristiga fordringar hos intresseföretag"
                    },
                    {
                        "Id": 8180,
                        "Text": "Återföringar av nedskrivningar av andelar i och långfristiga fordringar hos intresseföretag"
                    },
                    {
                        "Id": 8181,
                        "Text": "Återföringar av nedskrivningar av andelar i intresseföretag"
                    },
                    {
                        "Id": 8182,
                        "Text": "Återföringar av nedskrivningar av långfristiga fordringar hos intresseföretag"
                    }
                ]
            },
            {
                "Id": 82,
                "Text": "Resultat från övriga värdepapper och långfristiga fordringar (anläggningstillgångar)",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 8210,
                        "Text": "Utdelningar på andelar i andra företag"
                    },
                    {
                        "Id": 8212,
                        "Text": "Utdelningar, övriga företag"
                    },
                    {
                        "Id": 8216,
                        "Text": "Insatsemissioner, övriga företag"
                    },
                    {
                        "Id": 8220,
                        "Text": "Resultat vid försäljning av värdepapper i och långfristiga fordringar hos andra företag"
                    },
                    {
                        "Id": 8221,
                        "Text": "Resultat vid försäljning av andelar i andra företag"
                    },
                    {
                        "Id": 8222,
                        "Text": "Resultat vid försäljning av långfristiga fordringar hos andra företag"
                    },
                    {
                        "Id": 8223,
                        "Text": "Resultat vid försäljning av derivat (långfristiga värdepappersinnehav)"
                    },
                    {
                        "Id": 8228,
                        "Text": "Värdeförändring kapitalförsäkring, skattemässig justering"
                    },
                    {
                        "Id": 8230,
                        "Text": "Valutakursdifferenser på långfristiga fordringar"
                    },
                    {
                        "Id": 8231,
                        "Text": "Valutakursvinster på långfristiga fordringar"
                    },
                    {
                        "Id": 8236,
                        "Text": "Valutakursförluster på långfristiga fordringar"
                    },
                    {
                        "Id": 8240,
                        "Text": "Resultatandelar från handelsbolag (andra företag)"
                    },
                    {
                        "Id": 8250,
                        "Text": "Ränteintäkter från långfristiga fordringar hos och värdepapper i andra företag"
                    },
                    {
                        "Id": 8251,
                        "Text": "Ränteintäkter från långfristiga fordringar"
                    },
                    {
                        "Id": 8252,
                        "Text": "Ränteintäkter från övriga värdepapper"
                    },
                    {
                        "Id": 8254,
                        "Text": "Skattefria ränteintäkter, långfristiga tillgångar"
                    },
                    {
                        "Id": 8260,
                        "Text": "Ränteintäkter från långfristiga fordringar hos koncernföretag"
                    },
                    {
                        "Id": 8261,
                        "Text": "Ränteintäkter från långfristiga fordringar hos moderföretag"
                    },
                    {
                        "Id": 8262,
                        "Text": "Ränteintäkter från långfristiga fordringar hos dotterföretag"
                    },
                    {
                        "Id": 8263,
                        "Text": "Ränteintäkter från långfristiga fordringar hos andra koncernföretag"
                    },
                    {
                        "Id": 8270,
                        "Text": "Nedskrivningar av innehav av andelar i och långfristiga fordringar hos andra företag"
                    },
                    {
                        "Id": 8271,
                        "Text": "Nedskrivningar av andelar i andra företag"
                    },
                    {
                        "Id": 8272,
                        "Text": "Nedskrivningar av långfristiga fordringar hos andra företag"
                    },
                    {
                        "Id": 8273,
                        "Text": "Nedskrivningar av övriga värdepapper hos andra företag"
                    },
                    {
                        "Id": 8280,
                        "Text": "Återföringar av nedskrivningar av andelar i och långfristiga fordringar hos andra företag"
                    },
                    {
                        "Id": 8281,
                        "Text": "Återföringar av nedskrivningar av andelar i andra företag"
                    },
                    {
                        "Id": 8282,
                        "Text": "Återföringar av nedskrivningar av långfristiga fordringar hos andra företag"
                    },
                    {
                        "Id": 8283,
                        "Text": "Återföringar av nedskrivningar av övriga värdepapper i andra företag"
                    },
                    {
                        "Id": 8290,
                        "Text": "Värdering till verkligt värde, anläggningstillgångar"
                    },
                    {
                        "Id": 8291,
                        "Text": "Orealiserade värdeförändringar på anläggningstillgångar"
                    },
                    {
                        "Id": 8295,
                        "Text": "Orealiserade värdeförändringar på derivatinstrument"
                    }
                ]
            },
            {
                "Id": 83,
                "Text": "Övriga ränteintäkter och liknande resultatposter",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 8310,
                        "Text": "Ränteintäkter från omsättningstillgångar"
                    },
                    {
                        "Id": 8311,
                        "Text": "Ränteintäkter från bank"
                    },
                    {
                        "Id": 8312,
                        "Text": "Ränteintäkter från kortfristiga placeringar"
                    },
                    {
                        "Id": 8313,
                        "Text": "Ränteintäkter från kortfristiga fordringar"
                    },
                    {
                        "Id": 8314,
                        "Text": "Skattefria ränteintäkter"
                    },
                    {
                        "Id": 8317,
                        "Text": "Ränteintäkter för dold räntekompensation"
                    },
                    {
                        "Id": 8319,
                        "Text": "Övriga ränteintäkter från omsättningstillgångar"
                    },
                    {
                        "Id": 8320,
                        "Text": "Värdering till verkligt värde, omsättningstillgångar"
                    },
                    {
                        "Id": 8321,
                        "Text": "Orealiserade värdeförändringar på omsättningstillgångar"
                    },
                    {
                        "Id": 8325,
                        "Text": "Orealiserade värdeförändringar på derivatinstrument (oms.-tillg.)"
                    },
                    {
                        "Id": 8330,
                        "Text": "Valutakursdifferenser på kortfristiga fordringar och placeringar"
                    },
                    {
                        "Id": 8331,
                        "Text": "Valutakursvinster på kortfristiga fordringar och placeringar"
                    },
                    {
                        "Id": 8336,
                        "Text": "Valutakursförluster på kortfristiga fordringar och placeringar"
                    },
                    {
                        "Id": 8340,
                        "Text": "Utdelningar på kortfristiga placeringar"
                    },
                    {
                        "Id": 8350,
                        "Text": "Resultat vid försäljning av kortfristiga placeringar"
                    },
                    {
                        "Id": 8360,
                        "Text": "Övriga ränteintäkter från koncernföretag"
                    },
                    {
                        "Id": 8361,
                        "Text": "Övriga ränteintäkter från moderföretag"
                    },
                    {
                        "Id": 8362,
                        "Text": "Övriga ränteintäkter från dotterföretag"
                    },
                    {
                        "Id": 8363,
                        "Text": "Övriga ränteintäkter från andra koncernföretag"
                    },
                    {
                        "Id": 8370,
                        "Text": "Nedskrivningar av kortfristiga placeringar"
                    },
                    {
                        "Id": 8380,
                        "Text": "Återföringar av nedskrivningar av kortfristiga placeringar"
                    },
                    {
                        "Id": 8390,
                        "Text": "Övriga finansiella intäkter"
                    },
                    {
                        "Id": 8398,
                        "Text": "Värdeförändring kortfristig placering, skattemässig justering"
                    }
                ]
            },
            {
                "Id": 84,
                "Text": "Räntekostnader och liknande resultatposter",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 8400,
                        "Text": "Räntekostnader (gruppkonto)"
                    },
                    {
                        "Id": 8410,
                        "Text": "Räntekostnader för långfristiga skulder"
                    },
                    {
                        "Id": 8411,
                        "Text": "Räntekostnader för obligations-, förlags- och konvertibla lån"
                    },
                    {
                        "Id": 8412,
                        "Text": "Räntedel i årets pensionskostnad"
                    },
                    {
                        "Id": 8413,
                        "Text": "Räntekostnader för checkräkningskredit"
                    },
                    {
                        "Id": 8414,
                        "Text": "Räntekostnader för byggnadskreditiv"
                    },
                    {
                        "Id": 8415,
                        "Text": "Räntekostnader för andra skulder till kreditinstitut"
                    },
                    {
                        "Id": 8417,
                        "Text": "Räntekostnader för dold räntekompensation m.m."
                    },
                    {
                        "Id": 8418,
                        "Text": "Avdragspost för räntesubventioner"
                    },
                    {
                        "Id": 8419,
                        "Text": "Övriga räntekostnader för långfristiga skulder"
                    },
                    {
                        "Id": 8420,
                        "Text": "Räntekostnader för kortfristiga skulder"
                    },
                    {
                        "Id": 8421,
                        "Text": "Räntekostnader till kreditinstitut"
                    },
                    {
                        "Id": 8422,
                        "Text": "Dröjsmålsräntor för leverantörsskulder"
                    },
                    {
                        "Id": 8423,
                        "Text": "Räntekostnader för skatter och avgifter"
                    },
                    {
                        "Id": 8429,
                        "Text": "Övriga räntekostnader för kortfristiga skulder"
                    },
                    {
                        "Id": 8430,
                        "Text": "Valutakursdifferenser på skulder"
                    },
                    {
                        "Id": 8431,
                        "Text": "Valutakursvinster på skulder"
                    },
                    {
                        "Id": 8436,
                        "Text": "Valutakursförluster på skulder"
                    },
                    {
                        "Id": 8440,
                        "Text": "Erhållna räntebidrag"
                    },
                    {
                        "Id": 8450,
                        "Text": "Orealiserade värdeförändringar på skulder"
                    },
                    {
                        "Id": 8451,
                        "Text": "Orealiserade värdeförändringar på skulder"
                    },
                    {
                        "Id": 8455,
                        "Text": "Orealiserade värdeförändringar på säkringsinstrument"
                    },
                    {
                        "Id": 8460,
                        "Text": "Räntekostnader till koncernföretag"
                    },
                    {
                        "Id": 8461,
                        "Text": "Räntekostnader till moderföretag"
                    },
                    {
                        "Id": 8462,
                        "Text": "Räntekostnader till dotterföretag"
                    },
                    {
                        "Id": 8463,
                        "Text": "Räntekostnader till andra koncernföretag"
                    },
                    {
                        "Id": 8480,
                        "Text": "Aktiverade ränteutgifter"
                    },
                    {
                        "Id": 8490,
                        "Text": "Övriga skuldrelaterade poster"
                    },
                    {
                        "Id": 8491,
                        "Text": "Erhållet ackord på skulder till kreditinstitut m.m."
                    }
                ]
            },
            {
                "Id": 87,
                "Text": "Extraordinära intäkter och kostnader",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 8710,
                        "Text": "Extraordinära intäkter"
                    },
                    {
                        "Id": 8750,
                        "Text": "Extraordinära kostnader"
                    }
                ]
            },
            {
                "Id": 88,
                "Text": "Bokslutsdispositioner",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 8810,
                        "Text": "Förändring av periodiseringsfond"
                    },
                    {
                        "Id": 8811,
                        "Text": "Avsättning till periodiseringsfond"
                    },
                    {
                        "Id": 8819,
                        "Text": "Återföring från periodiseringsfond"
                    },
                    {
                        "Id": 8820,
                        "Text": "Mottagna koncernbidrag"
                    },
                    {
                        "Id": 8830,
                        "Text": "Lämnade koncernbidrag"
                    },
                    {
                        "Id": 8840,
                        "Text": "Lämnade gottgörelser"
                    },
                    {
                        "Id": 8850,
                        "Text": "Förändring av överavskrivningar"
                    },
                    {
                        "Id": 8851,
                        "Text": "Förändring av överavskrivningar, immateriella anläggningstillgångar"
                    },
                    {
                        "Id": 8852,
                        "Text": "Förändring av överavskrivningar, byggnader och markanläggningar"
                    },
                    {
                        "Id": 8853,
                        "Text": "Förändring av överavskrivningar, maskiner och inventarier"
                    },
                    {
                        "Id": 8860,
                        "Text": "Förändring av ersättningsfond"
                    },
                    {
                        "Id": 8861,
                        "Text": "Avsättning till ersättningsfond för inventarier"
                    },
                    {
                        "Id": 8862,
                        "Text": "Avsättning till ersättningsfond för byggnader och markanläggningar"
                    },
                    {
                        "Id": 8863,
                        "Text": "Avsättning till ersättningsfond för mark"
                    },
                    {
                        "Id": 8864,
                        "Text": "Avsättning till ersättningsfond för djurlager i jordbruk och renskötsel"
                    },
                    {
                        "Id": 8865,
                        "Text": "Ianspråktagande av ersättningsfond för avskrivningar"
                    },
                    {
                        "Id": 8866,
                        "Text": "Ianspråktagande av ersättningsfond för annat än avskrivningar"
                    },
                    {
                        "Id": 8869,
                        "Text": "Återföring från ersättningsfond"
                    },
                    {
                        "Id": 8880,
                        "Text": "Förändring av obeskattade intäkter"
                    },
                    {
                        "Id": 8881,
                        "Text": "Avsättning till upphovsmannakonto"
                    },
                    {
                        "Id": 8882,
                        "Text": "Återföring från upphovsmannakonto"
                    },
                    {
                        "Id": 8885,
                        "Text": "Avsättning till skogskonto"
                    },
                    {
                        "Id": 8886,
                        "Text": "Återföring från skogskonto"
                    },
                    {
                        "Id": 8890,
                        "Text": "Övriga bokslutsdispositioner"
                    },
                    {
                        "Id": 8891,
                        "Text": "Förändring av skillnad mellan bokförd och faktisk pensionsskuld"
                    },
                    {
                        "Id": 8892,
                        "Text": "Nedskrivningar av konsolideringskaraktär av anläggningstillgångar"
                    },
                    {
                        "Id": 8896,
                        "Text": "Förändring av lagerreserv"
                    },
                    {
                        "Id": 8899,
                        "Text": "Övriga bokslutsdispositioner"
                    }
                ]
            },
            {
                "Id": 89,
                "Text": "Skatter och årets resultat",
                "ParentId": 0,
                "Accounts": [
                    {
                        "Id": 8910,
                        "Text": "Skatt som belastar årets resultat"
                    },
                    {
                        "Id": 8920,
                        "Text": "Skatt på grund av ändrad beskattning"
                    },
                    {
                        "Id": 8930,
                        "Text": "Restituerad skatt"
                    },
                    {
                        "Id": 8940,
                        "Text": "Uppskjuten skatt"
                    },
                    {
                        "Id": 8980,
                        "Text": "Övriga skatter"
                    },
                    {
                        "Id": 8990,
                        "Text": "Resultat"
                    },
                    {
                        "Id": 8999,
                        "Text": "Årets resultat"
                    }
                ]
            }
        ]
    }

]
