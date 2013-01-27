/**
 * Java legacy UUID support.
 */
(function () {
    load(scriptDir + '/uuid.helper.js');

    var platformSpecificUuidModifications = {
        "java": function (hex) {
            var msb = hex.substr(0, 16);
            var lsb = hex.substr(16, 16);
            msb = msb.substr(14, 2) + msb.substr(12, 2) + msb.substr(10, 2) + msb.substr(8, 2)
                + msb.substr(6, 2) + msb.substr(4, 2) + msb.substr(2, 2) + msb.substr(0, 2);
            lsb = lsb.substr(14, 2) + lsb.substr(12, 2) + lsb.substr(10, 2) + lsb.substr(8, 2)
                + lsb.substr(6, 2) + lsb.substr(4, 2) + lsb.substr(2, 2) + lsb.substr(0, 2);
            return msb + lsb;
        },
        "c#": function (hex) {
            return hex.substr(6, 2) + hex.substr(4, 2) + hex.substr(2, 2) + hex.substr(0, 2)
                + hex.substr(10, 2) + hex.substr(8, 2) + hex.substr(14, 2) + hex.substr(12, 2)
                + hex.substr(16, 16);
        },
        "default": function (hex) {
            return hex;
        }
    };

    UUID = function (uuid, type) {
        var hex = uuid.replace(/[{}-]/g, "");
        var typeNum = 4;
        if (type != undefined) {
            typeNum = 3;
            hex = platformSpecificUuidModifications[type](hex);
        }
        return new BinData(typeNum, hexToBase64(hex));
    };

    function uuidToString(uuid, uuidType) {
        var hex = platformSpecificUuidModifications[uuidType](base64ToHex(uuid.base64()));
        return hex.substr(0, 8) + '-' + hex.substr(8, 4) + '-' + hex.substr(12, 4)
            + '-' + hex.substr(16, 4) + '-' + hex.substr(20, 12);
    }

    var bd_super_tojson = BinData.prototype.tojson;

    BinData.prototype.tojson = function(indent , nolint) {
        if (this.subtype() === 3) {
            return 'UUID(' + colorize('"' + uuidToString(this, uuidType) + '"', "cyan") + ', ' + colorize('"' + uuidType + '"', "cyan") +')'
        } else if (this.subtype() === 4) {
            return 'UUID(' + colorize('"' + uuidToString(this, "default") + '"', "cyan") + ')'
        } else {
            return bd_super_tojson.call(this, indent, nolint);
        }
    };
})();