import app from "..";

app.get("/region", (c) => {
    return c.json({
        "continent": {
            "code": "EU",
            "geoname_id": 6255148,
            "names": {
                "de": "Europa",
                "en": "Europe",
                "es": "Europa",
                "fr": "Europe",
                "ja": "ヨーロッパ",
                "pt-BR": "Europa",
                "ru": "Европа",
                "zh-CN": "欧洲"
            }
        },
        "country": {
            "geoname_id": 2921044,
            "is_in_european_union": true,
            "iso_code": "DE",
            "names": {
                "de": "Deutschland",
                "en": "Germany",
                "es": "Alemania",
                "fr": "Allemagne",
                "ja": "ドイツ連邦共和国",
                "pt-BR": "Alemanha",
                "ru": "ФРГ",
                "zh-CN": "德国"
            }
        },
        "subdivisions": [
            {
                "geoname_id": 2847618,
                "iso_code": "RP",
                "names": {
                    "de": "Rheinland-Pfalz",
                    "en": "Rheinland-Pfalz",
                    "es": "Rheinland-Pfalz",
                    "fr": "Rhénanie-Palatinat",
                    "ja": "ラインラント＝プファルツ州",
                    "pt-BR": "Renânia-Palatinado",
                    "ru": "Рейнланд-Пфальц",
                    "zh-CN": "莱茵兰-普法尔茨"
                }
            }
        ]
    })
});