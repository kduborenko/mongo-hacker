/**
 * Java legacy UUID support.
 */
(function () {
    load(scriptDir + '/uuid.helper.js');

    function swapBytes(hex) {
        var msb = hex.substr(0, 16);
        var lsb = hex.substr(16, 16);
        msb = msb.substr(14, 2) + msb.substr(12, 2) + msb.substr(10, 2) + msb.substr(8, 2)
            + msb.substr(6, 2) + msb.substr(4, 2) + msb.substr(2, 2) + msb.substr(0, 2);
        lsb = lsb.substr(14, 2) + lsb.substr(12, 2) + lsb.substr(10, 2) + lsb.substr(8, 2)
            + lsb.substr(6, 2) + lsb.substr(4, 2) + lsb.substr(2, 2) + lsb.substr(0, 2);
        return msb + lsb;
    }

    UUID = function (uuid) {
        return new BinData(3, hexToBase64(
                swapBytes(uuid.replace(/[{}-]/g, ""))
            ));
    };

    function uuidToString(uuid) {
        var hex = swapBytes(base64ToHex(uuid.base64()));
        return hex.substr(0, 8) + '-' + hex.substr(8, 4) + '-' + hex.substr(12, 4)
            + '-' + hex.substr(16, 4) + '-' + hex.substr(20, 12);
    }

    var bd_super_tojson = BinData.prototype.tojson;

    BinData.prototype.tojson = function(indent , nolint) {
        return this.subtype() === 3
            ? 'UUID(' + colorize('"' + uuidToString(this) + '"', "cyan") + ')'
            : bd_super_tojson.call(this, indent, nolint);
    };
})();