"use strict";

/* Universial Module (UMD) design pattern
 * https://github.com/umdjs/umd/blob/master/templates/returnExports.js
 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // register as an AMD anonymous module
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        // use a node.js style export
        module.exports = factory();
    } else {
        // if this isn't running under Node or AMD, just set a global variable
        root.fido2Helpers = factory();
    }
    // the return value of this function is what becomes the AMD / CommonJS / Global export
}(this, function() { // eslint-disable-line no-invalid-this

    /********************************************************************************
     *********************************************************************************
     * FUNCTIONS
     *********************************************************************************
     *********************************************************************************/

    /* begin helpers */
    function printHex(msg, buf) {
        // if the buffer was a TypedArray (e.g. Uint8Array), grab its buffer and use that
        if (ArrayBuffer.isView(buf) && buf.buffer instanceof ArrayBuffer) {
            buf = buf.buffer;
        }

        // check the arguments
        if ((typeof msg != "string") ||
            (typeof buf != "object")) {
            console.log("Bad args to printHex"); // eslint-disable-line no-console
            return;
        }
        if (!(buf instanceof ArrayBuffer)) {
            console.log("Attempted printHex with non-ArrayBuffer:", buf); // eslint-disable-line no-console
            return;
        }

        // print the buffer as a 16 byte long hex string
        var arr = new Uint8Array(buf);
        var len = buf.byteLength;
        var i, str = "";
        console.log(msg, `(${buf.byteLength} bytes)`); // eslint-disable-line no-console
        for (i = 0; i < len; i++) {
            var hexch = arr[i].toString(16);
            hexch = (hexch.length == 1) ? ("0" + hexch) : hexch;
            str += hexch.toUpperCase() + " ";
            if (i && !((i + 1) % 16)) {
                console.log(str); // eslint-disable-line no-console
                str = "";
            }
        }
        // print the remaining bytes
        if ((i) % 16) {
            console.log(str); // eslint-disable-line no-console
        }
    }

    function arrayBufferEquals(b1, b2) {
        if (!(b1 instanceof ArrayBuffer) ||
            !(b2 instanceof ArrayBuffer)) {
            return false;
        }

        if (b1.byteLength !== b2.byteLength) return false;
        b1 = new Uint8Array(b1);
        b2 = new Uint8Array(b2);
        for (let i = 0; i < b1.byteLength; i++) {
            if (b1[i] !== b2[i]) return false;
        }
        return true;
    }

    function hex2ab(hex) {
        if (typeof hex !== "string") {
            throw new TypeError("Expected input to be a string");
        }

        if ((hex.length % 2) !== 0) {
            throw new RangeError("Expected string to be an even number of characters");
        }

        var view = new Uint8Array(hex.length / 2);

        for (var i = 0; i < hex.length; i += 2) {
            view[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }

        return view.buffer;
    }

    function str2ab(str) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    // borrowed from:
    // https://github.com/niklasvh/base64-arraybuffer/blob/master/lib/base64-arraybuffer.js
    // modified to base64url by Yuriy :)
    /*
     * base64-arraybuffer
     * https://github.com/niklasvh/base64-arraybuffer
     *
     * Copyright (c) 2012 Niklas von Hertzen
     * Licensed under the MIT license.
     */
    // var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    // Use a lookup table to find the index.
    var lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }

    function b64decode(base64) {
        if (typeof base64 !== "string") {
            throw new TypeError("exepcted base64 to be string, got: " + base64);
        }

        base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
        var bufferLength = base64.length * 0.75,
            len = base64.length,
            i, p = 0,
            encoded1, encoded2, encoded3, encoded4;

        if (base64[base64.length - 1] === "=") {
            bufferLength--;
            if (base64[base64.length - 2] === "=") {
                bufferLength--;
            }
        }

        var arraybuffer = new ArrayBuffer(bufferLength),
            bytes = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return arraybuffer;
    }

    function b64encode(arraybuffer) {
        var bytes = new Uint8Array(arraybuffer),
            i, len = bytes.length,
            base64 = "";

        for (i = 0; i < len; i += 3) {
            base64 += chars[bytes[i] >> 2];
            base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += chars[bytes[i + 2] & 63];
        }

        if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1) + "=";
        } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + "==";
        }

        return base64;
    }

    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    function bufEqual(a, b) {
        var len = a.length;

        if (!(a instanceof Buffer) ||
            !(b instanceof Buffer)) {
            throw new TypeError("bad args: expected Buffers");
        }

        if (len !== b.length) {
            return false;
        }

        for (let i = 0; i < len; i++) {
            if (a.readUInt8(i) !== b.readUInt8(i)) {
                return false;
            }
        }

        return true;
    }

    function abEqual(a, b) {
        var len = a.byteLength;

        if (len !== b.byteLength) {
            return false;
        }

        a = new Uint8Array(a);
        b = new Uint8Array(b);
        for (let i = 0; i < len; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }

        return true;
    }

    // function cloneObject(o) {
    //     if (o === undefined) {
    //         throw new TypeError("obj was undefined");
    //     }

    //     var output, v, key;
    //     output = Array.isArray(o) ? [] : {};
    //     for (key in o) { // eslint-disable-line guard-for-in
    //         v = o[key];
    //         output[key] = (typeof v === "object") ? copy(v) : v;
    //     }
    //     return output;
    // }

    function cloneObject(obj) {
        if (obj === undefined) {
            throw new TypeError("obj was undefined");
        }
        return JSON.parse(JSON.stringify(obj));
    }

    function coerceToArrayBuffer(buf, name) {
        if (typeof buf === "string") {
            // base64url to base64
            buf = buf.replace(/-/g, "+").replace(/_/g, "/");
            // base64 to Buffer
            buf = Buffer.from(buf, "base64");
        }

        // Buffer or Array to Uint8Array
        if (buf instanceof Buffer || Array.isArray(buf)) {
            buf = new Uint8Array(buf);
        }

        // Uint8Array to ArrayBuffer
        if (buf instanceof Uint8Array) {
            buf = buf.buffer;
        }

        // error if none of the above worked
        if (!(buf instanceof ArrayBuffer)) {
            throw new TypeError(`could not coerce '${name}' to ArrayBuffer`);
        }

        return buf;
    }

    var functions = {
        printHex,
        arrayBufferEquals,
        hex2ab,
        str2ab,
        b64decode,
        b64encode,
        ab2str,
        bufEqual,
        abEqual,
        cloneObject,
        coerceToArrayBuffer
    };


    /********************************************************************************
     *********************************************************************************
     * CTAP2 MSGS
     *********************************************************************************
     *********************************************************************************/

    // var makeCredReq = "AaQBWCAmxXQY29T5II0ouvR1rOW0iHKXRtx5dKEFO_8Ezgl51gKiYmlkc2h0dHBzOi8vZXhhbXBsZS5jb21kbmFtZXgYVGhlIEV4YW1wbGUgQ29ycG9yYXRpb24hA6RiaWRYIIt5GedNcaaY_GSTvnLIEagifkIT4fV8oCd_eAf6MivpZGljb254KGh0dHBzOi8vcGljcy5hY21lLmNvbS8wMC9wL2FCampqcHFQYi5wbmdkbmFtZXZqb2hucHNtaXRoQGV4YW1wbGUuY29ta2Rpc3BsYXlOYW1lbUpvaG4gUC4gU21pdGgEgqJjYWxnJmR0eXBlanB1YmxpYy1rZXmiY2FsZzkBAGR0eXBlanB1YmxpYy1rZXk";
    // var ctap2ClientData = "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoibU11LVlVUU85amZYZWIyaWNIeXlJRWJRelN1VFJNbXFlR3hka3R3UVZ6dyIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20ifQ";
    // var makeCredResp = "AKMBZnBhY2tlZAJZAMQQBoCtVGzmpXf0L1LfM7TP3KdWhZ5mS4194ymxUNCc6UEAAAQE-KAR84wKTRWABhcRH57cfQBAVnYjWrbswoCsYrv7iPDzl1-2Q9ACivVIhP2p_GumWw-HFo5Q7Tlo0vdiHk7E2Bc_u32IpTDK4nhBu5GPRWfXeKUBAgMmIAEhWCB2k630Xmpgcw1Hs0-h6uyOTCDFfIjLCQ6CBNnuHi7B4iJYIBHcfy7jcKW1eZE5LqbFSu3Mq8i100Pt1dM4uXljlSO2A6NjYWxnJmNzaWdYRzBFAiAAzt45GP_n-VK_xdKDrdsPdSLLPN_8tIQ5Gjloi5vSzAIhAICTWwvWjdvehi2v5g7kk48t0mZWudF1zJkMvKrl2hCWY3g1Y4FZAZcwggGTMIIBOKADAgECAgkAhZtybLJLTCkwCgYIKoZIzj0EAwIwRzELMAkGA1UEBhMCVVMxFDASBgNVBAoMC1l1YmljbyBUZXN0MSIwIAYDVQQLDBlBdXRoZW50aWNhdG9yIEF0dGVzdGF0aW9uMB4XDTE2MTIwNDExNTUwMFoXDTI2MTIwMjExNTUwMFowRzELMAkGA1UEBhMCVVMxFDASBgNVBAoMC1l1YmljbyBUZXN0MSIwIAYDVQQLDBlBdXRoZW50aWNhdG9yIEF0dGVzdGF0aW9uMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErRHrDohS5TrV3-2GtB5hNKGOxOGvjyIaPH1uY2yA6hPD1QT_LnYhG7RFJbGWxEy0hJl5z2-Jbs0ruGDeG_Q3a6MNMAswCQYDVR0TBAIwADAKBggqhkjOPQQDAgNJADBGAiEA6aOfGwMZdSX3Nz4QznfngCFzG5TQwD8_2h_SLbPQMOcCIQDE-uw0Raggz0MSnNsAqr79muLYdPnF00PLLxE9ojcj8w";

    // var getAssertionReq = "AqMBc2h0dHBzOi8vZXhhbXBsZS5jb20CWCAzxPe7r0xKXYUt1EQReyXHwOpvEmNkDb9PmQcxRMU58QOBomJpZFhAVnYjWrbswoCsYrv7iPDzl1-2Q9ACivVIhP2p_GumWw-HFo5Q7Tlo0vdiHk7E2Bc_u32IpTDK4nhBu5GPRWfXeGR0eXBlanB1YmxpYy1rZXkeyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiVU9mREVnbThrMWRfaU5UM2ZXdDFkZVloSDRrT3JPS1BpV2xCNmYyNGRjTSIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20ifQ";
    // var getAssertionResp = "AKMBomJpZFhAVnYjWrbswoCsYrv7iPDzl1-2Q9ACivVIhP2p_GumWw-HFo5Q7Tlo0vdiHk7E2Bc_u32IpTDK4nhBu5GPRWfXeGR0eXBlanB1YmxpYy1rZXkCWQAlEAaArVRs5qV39C9S3zO0z9ynVoWeZkuNfeMpsVDQnOkBAAAEBQNYRjBEAiAIFzgGvsa1zUOkoirFZ6KpeXFuX5NgvRenz47_kySpIgIgDMnl-UfMYfA9OQwbkSQd2qJvbPIF4XZZVX1NNKzuwEw";


    /********************************************************************************
     *********************************************************************************
     * SERVER MSGS
     *********************************************************************************
     *********************************************************************************/

    var creationOptionsRequest = {
        username: "bubba",
        displayName: "Bubba Smith",
        authenticatorSelection: {
            authenticatorAttachment: "cross-platform",
            requireResidentKey: false,
            userVerification: "preferred"
        },
        attestation: "none"
    };

    var basicCreationOptions = {
        status: "ok",
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==",
        rp: {
            name: "My RP"
        },
        user: {
            id: "YWRhbQ==",
            displayName: "Adam Powers",
            name: "apowers"
        },
        pubKeyCredParams: [{
            alg: -7,
            type: "public-key"
        }]
    };

    var completeCreationOptions = {
        status: "ok",
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==",
        rp: {
            name: "My RP",
            id: "TXkgUlA=",
            icon: "aWNvbnBuZ2RhdGFibGFoYmxhaGJsYWg="
        },
        user: {
            id: "YWRhbQ==",
            displayName: "Adam Powers",
            name: "apowers",
            icon: "aWNvbnBuZ2RhdGFibGFoYmxhaGJsYWg="
        },
        pubKeyCredParams: [{
            alg: -7,
            type: "public-key"
        }],
        timeout: 30000,
        excludeCredentials: [{
            type: "public-key",
            id: "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
            transports: ["usb", "nfc", "ble"]
        }],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: true,
            userVerification: "required"
        },
        attestation: "direct",
        extensions: {}
    };

    var challengeResponseAttestationNoneMsgB64Url = {
        "rawId": "AAii3V6sGoaozW7TbNaYlJaJ5br8TrBfRXnofZO6l2suc3a5tt_XFuFkFA_5eabU80S1PW0m4IZ79BS2kQO7Zcuy2vf0ESg18GTLG1mo5YSkIdqL2J44egt-6rcj7NedSEwxa_uuxUYBtHNnSQqDmtoUAfM9LSWLl65BjKVZNGUp9ao33mMSdVfQQ0bHze69JVQvLBf8OTiZUqJsOuKmpqUc",
        "id": "AAii3V6sGoaozW7TbNaYlJaJ5br8TrBfRXnofZO6l2suc3a5tt_XFuFkFA_5eabU80S1PW0m4IZ79BS2kQO7Zcuy2vf0ESg18GTLG1mo5YSkIdqL2J44egt-6rcj7NedSEwxa_uuxUYBtHNnSQqDmtoUAfM9LSWLl65BjKVZNGUp9ao33mMSdVfQQ0bHze69JVQvLBf8OTiZUqJsOuKmpqUc",
        "response": {
            "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVkBJkmWDeWIDoxodDQXD2R2YFuP5K65ooYyx5lc87qDHZdjQQAAAAAAAAAAAAAAAAAAAAAAAAAAAKIACKLdXqwahqjNbtNs1piUlonluvxOsF9Feeh9k7qXay5zdrm239cW4WQUD_l5ptTzRLU9bSbghnv0FLaRA7tly7La9_QRKDXwZMsbWajlhKQh2ovYnjh6C37qtyPs151ITDFr-67FRgG0c2dJCoOa2hQB8z0tJYuXrkGMpVk0ZSn1qjfeYxJ1V9BDRsfN7r0lVC8sF_w5OJlSomw64qampRylAQIDJiABIVgguxHN3W6ehp0VWXKaMNie1J82MVJCFZYScau74o17cx8iWCDb1jkTLi7lYZZbgwUwpqAk8QmIiPMTVQUVkhGEyGrKww==",
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiIzM0VIYXYtaloxdjlxd0g3ODNhVS1qMEFSeDZyNW8tWUhoLXdkN0M2alBiZDdXaDZ5dGJJWm9zSUlBQ2Vod2Y5LXM2aFhoeVNITy1ISFVqRXdaUzI5dyIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0="
        }
    };

    var getOptionsRequest = {
        username: "bubba",
        displayName: "Bubba Smith"
    };

    var basicGetOptions = {
        status: "ok",
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA=="
    };

    var completeGetOptions = {
        status: "ok",
        challenge: "sP4MiwodjreC8-80IMjcyWNlo_Y1SJXmFgQNBilnjdf30WRsjFDhDYmfY4-4uhq2HFjYREbXdr6Vjuvz2XvTjA==",
        timeout: 60000,
        rpId: "My RP",
        allowCredentials: [{
            type: "public-key",
            id: "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
            transports: ["usb", "nfc", "ble"]
        }],
        userVerification: "discouraged",
        extensions: {}
    };

    var challengeResponseAttestationU2fMsgB64Url = {
        // "binaryEncoding": "base64",
        "username": "adam",
        "rawId": "Bo-VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd-GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT_e698IirQ==",
        "id": "Bo-VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd-GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT_e698IirQ==",
        "response": {
            "attestationObject": "o2NmbXRoZmlkby11MmZnYXR0U3RtdKJjc2lnWEgwRgIhAO-683ISJhKdmUPmVbQuYZsp8lkD7YJcInHS3QOfbrioAiEAzgMJ499cBczBw826r1m55Jmd9mT4d1iEXYS8FbIn8MpjeDVjgVkCSDCCAkQwggEuoAMCAQICBFVivqAwCwYJKoZIhvcNAQELMC4xLDAqBgNVBAMTI1l1YmljbyBVMkYgUm9vdCBDQSBTZXJpYWwgNDU3MjAwNjMxMCAXDTE0MDgwMTAwMDAwMFoYDzIwNTAwOTA0MDAwMDAwWjAqMSgwJgYDVQQDDB9ZdWJpY28gVTJGIEVFIFNlcmlhbCAxNDMyNTM0Njg4MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAESzMfdz2BRLmZXL5FhVF-F1g6pHYjaVy-haxILIAZ8sm5RnrgRbDmbxMbLqMkPJH9pgLjGPP8XY0qerrnK9FDCaM7MDkwIgYJKwYBBAGCxAoCBBUxLjMuNi4xLjQuMS40MTQ4Mi4xLjUwEwYLKwYBBAGC5RwCAQEEBAMCBSAwCwYJKoZIhvcNAQELA4IBAQCsFtmzbrazqbdtdZSzT1n09z7byf3rKTXra0Ucq_QdJdPnFhTXRyYEynKleOMj7bdgBGhfBefRub4F226UQPrFz8kypsr66FKZdy7bAnggIDzUFB0-629qLOmeOVeAMmOrq41uxICn3whK0sunt9bXfJTD68CxZvlgV8r1_jpjHqJqQzdio2--z0z0RQliX9WvEEmqfIvHaJpmWemvXejw1ywoglF0xQ4Gq39qB5CDe22zKr_cvKg1y7sJDvHw2Z4Iab_p5WdkxCMObAV3KbAQ3g7F-czkyRwoJiGOqAgau5aRUewWclryqNled5W8qiJ6m5RDIMQnYZyq-FTZgpjXaGF1dGhEYXRhWMRJlg3liA6MaHQ0Fw9kdmBbj-SuuaKGMseZXPO6gx2XY0EAAAAAAAAAAAAAAAAAAAAAAAAAAABABo-VjHOkJZy8DjnCJnIc0Oxt9QAz5upMdSJxNbd-GyAo6MNIvPBb9YsUlE0ZJaaWXtWH5FQyPS6bT_e698IiraUBAgMmIAEhWCA1c9AIeH5sN6x1Q-2qR7v255tkeGbWs0ECCDw35kJGBCJYIBjTUxruadjFFMnWlR5rPJr23sBJT9qexY9PCc9o8hmT",
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJWdTh1RHFua3dPamQ4M0tMajZTY24yQmdGTkxGYkdSN0txX1hKSndRbm5hdHp0VVI3WElCTDdLOHVNUENJYVFtS3cxTUNWUTVhYXpOSkZrN05ha2dxQSIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0="
        }
    };

    var challengeResponseAttestationU2fHypersecuB64UrlMsg = {
        "rawId": "HRiuOZKJ6yNnBrSnocnFuGgsjcAZICl4-0uEDAQHCIXncWQCkYUBvvUzZQovrxmeB9Qm23hmj6PnzWyoiWtt8w",
        "id": "HRiuOZKJ6yNnBrSnocnFuGgsjcAZICl4-0uEDAQHCIXncWQCkYUBvvUzZQovrxmeB9Qm23hmj6PnzWyoiWtt8w",
        "response":
            {
                "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJwU0c5ejZHZDVtNDhXV3c5ZTAzQUppeGJLaWEweW5FcW03b185S0VrUFkwemNhWGhqbXhvQ2hDNVFSbks0RTZYSVQyUUZjX3VHeWNPNWxVTXlnZVpndyIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vd2ViYXV0aG4ub3JnIiwidHlwZSI6IndlYmF1dGhuLmNyZWF0ZSJ9",
                "attestationObject": "o2NmbXRoZmlkby11MmZnYXR0U3RtdKJjc2lnWEgwRgIhANsxYs-ntdvXjEaGTl-T91fmoSQCCzLEmXpzwuIqSrzUAiEA2vnx_cP4Ck9ASruZ7NdCtHKleCfd0NwCHcv2cMj175JjeDVjgVkBQDCCATwwgeSgAwIBAgIKOVGHiTh4UmRUCTAKBggqhkjOPQQDAjAXMRUwEwYDVQQDEwxGVCBGSURPIDAxMDAwHhcNMTQwODE0MTgyOTMyWhcNMjQwODE0MTgyOTMyWjAxMS8wLQYDVQQDEyZQaWxvdEdudWJieS0wLjQuMS0zOTUxODc4OTM4Nzg1MjY0NTQwOTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABIeOKoi1TAiEYdCsb8XIAncH9Ko9EuGkXEugACIy1mV0fefgs7ZA4hnz5X3CS67eUWgMASZzpwKHVybohhppKGAwCgYIKoZIzj0EAwIDRwAwRAIg6BuIpLPxP_wPNiOJZJiqKKKlBUB2CgCwMYibSjki5S8CIOPFCx-Y1JKxbJ7nDs96PsvjDcRfpynzvswDG_V6VuK0aGF1dGhEYXRhWMSVaQiPHs7jIylUA129ENfK45EwWidRtVm7j9fLsim91EEAAAAAAAAAAAAAAAAAAAAAAAAAAABAHRiuOZKJ6yNnBrSnocnFuGgsjcAZICl4-0uEDAQHCIXncWQCkYUBvvUzZQovrxmeB9Qm23hmj6PnzWyoiWtt86UBAgMmIAEhWCCHjiqItUwIhGHQrG_FyAJ3B_SqPRLhpFxLoAAiMtZldCJYIH3n4LO2QOIZ8-V9wkuu3lFoDAEmc6cCh1cm6IYaaShg"
            }

    };

    var challengeResponseAttestationPackedB64UrlMsg = {
        "rawId": "sL39APyTmisrjh11vghaqNfuruLQmCfR0c1ryKtaQ81jkEhNa5u9xLTnkibvXC9YpzBLFwWEZ3k9CR_sxzm_pWYbBOtKxeZu9z2GT8b6QW4iQvRlyumCT3oENx_8401r",
        "id": "sL39APyTmisrjh11vghaqNfuruLQmCfR0c1ryKtaQ81jkEhNa5u9xLTnkibvXC9YpzBLFwWEZ3k9CR_sxzm_pWYbBOtKxeZu9z2GT8b6QW4iQvRlyumCT3oENx_8401r",
        "response": {
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJ1Vlg4OElnUmEwU1NyTUlSVF9xN2NSY2RmZ2ZSQnhDZ25fcGtwVUFuWEpLMnpPYjMwN3dkMU9MWFEwQXVOYU10QlIzYW1rNkhZenAtX1Z4SlRQcHdHdyIsIm9yaWdpbiI6Imh0dHBzOi8vd2ViYXV0aG4ub3JnIiwidG9rZW5CaW5kaW5nIjp7InN0YXR1cyI6Im5vdC1zdXBwb3J0ZWQifSwidHlwZSI6IndlYmF1dGhuLmNyZWF0ZSJ9",
            "attestationObject": "o2NmbXRmcGFja2VkZ2F0dFN0bXSjY2FsZyZjc2lnWEgwRgIhAIsK0Wr9tmud-waIYoQw20UWi7DL_gDx_PNG3PB57eHLAiEAtRyd-4JI2pCVX-dDz4mbHc_AkvC3d_4qnBBa3n2I_hVjeDVjg1kCRTCCAkEwggHooAMCAQICEBWfe8LNiRjxKGuTSPqfM-IwCgYIKoZIzj0EAwIwSTELMAkGA1UEBhMCQ04xHTAbBgNVBAoMFEZlaXRpYW4gVGVjaG5vbG9naWVzMRswGQYDVQQDDBJGZWl0aWFuIEZJRE8yIENBLTEwIBcNMTgwNDExMDAwMDAwWhgPMjAzMzA0MTAyMzU5NTlaMG8xCzAJBgNVBAYTAkNOMR0wGwYDVQQKDBRGZWl0aWFuIFRlY2hub2xvZ2llczEiMCAGA1UECwwZQXV0aGVudGljYXRvciBBdHRlc3RhdGlvbjEdMBsGA1UEAwwURlQgQmlvUGFzcyBGSURPMiBVU0IwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASABnVcWfvJSbAVqNIKkliXvoMKsu_oLPiP7aCQlmPlSMcfEScFM7QkRnidTP7hAUOKlOmDPeIALC8qHddvTdtdo4GJMIGGMB0GA1UdDgQWBBR6VIJCgGLYiuevhJglxK-RqTSY8jAfBgNVHSMEGDAWgBRNO9jEZxUbuxPo84TYME-daRXAgzAMBgNVHRMBAf8EAjAAMBMGCysGAQQBguUcAgEBBAQDAgUgMCEGCysGAQQBguUcAQEEBBIEEEI4MkVENzNDOEZCNEU1QTIwCgYIKoZIzj0EAwIDRwAwRAIgJEtFo76I3LfgJaLGoxLP-4btvCdKIsEFLjFIUfDosIcCIDQav04cJPILGnPVPazCqfkVtBuyOmsBbx_v-ODn-JDAWQH_MIIB-zCCAaCgAwIBAgIQFZ97ws2JGPEoa5NI-p8z4TAKBggqhkjOPQQDAjBLMQswCQYDVQQGEwJDTjEdMBsGA1UECgwURmVpdGlhbiBUZWNobm9sb2dpZXMxHTAbBgNVBAMMFEZlaXRpYW4gRklETyBSb290IENBMCAXDTE4MDQxMDAwMDAwMFoYDzIwMzgwNDA5MjM1OTU5WjBJMQswCQYDVQQGEwJDTjEdMBsGA1UECgwURmVpdGlhbiBUZWNobm9sb2dpZXMxGzAZBgNVBAMMEkZlaXRpYW4gRklETzIgQ0EtMTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABI5-YAnswRZlzKD6w-lv5Qg7lW1XJRHrWzL01mc5V91n2LYXNR3_S7mA5gupuTO5mjQw8xfqIRMHVr1qB3TedY-jZjBkMB0GA1UdDgQWBBRNO9jEZxUbuxPo84TYME-daRXAgzAfBgNVHSMEGDAWgBTRoZhNgX_DuWv2B2e9UBL-kEXxVDASBgNVHRMBAf8ECDAGAQH_AgEAMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAgNJADBGAiEA-3-j0kBHoRFQwnhWbSHMkBaY7KF_TztINFN5ymDkwmUCIQDrCkPBiMHXvYg-kSRgVsKwuVtYonRvC588qRwpLStZ7FkB3DCCAdgwggF-oAMCAQICEBWfe8LNiRjxKGuTSPqfM9YwCgYIKoZIzj0EAwIwSzELMAkGA1UEBhMCQ04xHTAbBgNVBAoMFEZlaXRpYW4gVGVjaG5vbG9naWVzMR0wGwYDVQQDDBRGZWl0aWFuIEZJRE8gUm9vdCBDQTAgFw0xODA0MDEwMDAwMDBaGA8yMDQ4MDMzMTIzNTk1OVowSzELMAkGA1UEBhMCQ04xHTAbBgNVBAoMFEZlaXRpYW4gVGVjaG5vbG9naWVzMR0wGwYDVQQDDBRGZWl0aWFuIEZJRE8gUm9vdCBDQTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABJ3wCm47zF9RMtW-pPlkEHTVTLfSYBlsidz7zOAUiuV6k36PvtKAI_-LZ8MiC9BxQUfUrfpLY6klw344lwLq7POjQjBAMB0GA1UdDgQWBBTRoZhNgX_DuWv2B2e9UBL-kEXxVDAPBgNVHRMBAf8EBTADAQH_MA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAgNIADBFAiEAt7E9ZQYxnhfsSk6c1dSmFNnJGoU3eJiycs2DoWh7-IoCIA9iWJH8h-UOAaaPK66DtCLe6GIxdpIMv3kmd1PRpWqsaGF1dGhEYXRhWOSVaQiPHs7jIylUA129ENfK45EwWidRtVm7j9fLsim91EEAAAABQjgyRUQ3M0M4RkI0RTVBMgBgsL39APyTmisrjh11vghaqNfuruLQmCfR0c1ryKtaQ81jkEhNa5u9xLTnkibvXC9YpzBLFwWEZ3k9CR_sxzm_pWYbBOtKxeZu9z2GT8b6QW4iQvRlyumCT3oENx_8401rpQECAyYgASFYIFkdweEE6mWiIAYPDoKz3881Aoa4sn8zkTm0aPKKYBvdIlggtlG32lxrang8M0tojYJ36CL1VMv2pZSzqR_NfvG88bA"
        }
    };

    var challengeResponseAttestationTpmB64UrlMsg = {
        "rawId": "hWzdFiPbOMQ5KNBsMhs-Zeh8F0iTHrH63YKkrxJFgjQ",
        "id": "hWzdFiPbOMQ5KNBsMhs-Zeh8F0iTHrH63YKkrxJFgjQ",
        "response": {
            "clientDataJSON": "ew0KCSJ0eXBlIiA6ICJ3ZWJhdXRobi5jcmVhdGUiLA0KCSJjaGFsbGVuZ2UiIDogIndrNkxxRVhBTUFacHFjVFlsWTJ5b3I1RGppeUlfYjFneTluRE90Q0IxeUdZbm1fNFdHNFVrMjRGQXI3QXhUT0ZmUU1laWdrUnhPVExaTnJMeEN2Vl9RIiwNCgkib3JpZ2luIiA6ICJodHRwczovL3dlYmF1dGhuLm9yZyIsDQoJInRva2VuQmluZGluZyIgOiANCgl7DQoJCSJzdGF0dXMiIDogInN1cHBvcnRlZCINCgl9DQp9",
            "attestationObject": "o2NmbXRjdHBtaGF1dGhEYXRhWQFnlWkIjx7O4yMpVANdvRDXyuORMFonUbVZu4_Xy7IpvdRFAAAAAAiYcFjK3EuBtuEw3lDcvpYAIIVs3RYj2zjEOSjQbDIbPmXofBdIkx6x-t2CpK8SRYI0pAEDAzkBACBZAQDF2m9Nk1e94gL1xVjNCjFW0lTy4K2atXkx-YJrdH3hrE8p1gcIdNzleRDhmERJnY5CRwM5sXDQIrUBq4jpwvTtMC5HGccN6-iEJAPtm9_CJzCmGhtw9hbF8bcAys94RhN9xLLUaajhWqtPrYZXCEAi0o9E2QdTIxJrcAfJgZOf33JMr0--R1BAQxpOoGRDC8ss-tfQW9ufZLWw4JUuz4Z5Jz1sbfqBYB8UUDMWoT0HgsMaPmvd7T17xGvB-pvvDf-Dt96vFGtYLEZEgho8Yu26pr5CK_BOQ-2vX9N4MIYVPXNhogMGGmKYqybhM3yhye0GdBpZBUd5iOcgME6uGJ1_IUMBAAFnYXR0U3RtdKZjdmVyYzIuMGNhbGc5__5jc2lnWQEAcV1izWGUWIs0DEOZNQGdriNNXo6nbrGDLzEAeswCK9njYGCLmOkHVgSyafhsjCEMZkQmuPUmEOMDKosqxup_tiXQwG4yCW9TyWoINWGayQ4vcr6Ys-l6KMPkg__d2VywhfonnTJDBfE_4BIRD60GR0qBzTarthDHQFMqRtoUtuOsTF5jedU3EQPojRA5iCNC2naCCZuMSURdlPmhlW5rAaRZVF41ZZECi5iFOM2rO0UpGuQSLUvr1MqQOsDytMf7qWZMvwT_5_8BF6GNdB2l2VzmIJBbV6g8z7dj0fRkjlCXBp8UG2LvTq5SsfugrRWXOJ8BkdMplPfl0mz6ssU_n2N4NWOCWQS2MIIEsjCCA5qgAwIBAgIQEyidpWZzRxOSMNfrAvV1fzANBgkqhkiG9w0BAQsFADBBMT8wPQYDVQQDEzZOQ1UtTlRDLUtFWUlELTE1OTFENEI2RUFGOThEMDEwNDg2NEI2OTAzQTQ4REQwMDI2MDc3RDMwHhcNMTgwNTIwMTYyMDQ0WhcNMjgwNTIwMTYyMDQ0WjAAMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvQ6XK2ujM11E7x4SL34p252ncyQTd3-4r5ALQhBbFKS95gUsuENTG-48GBQwu48i06cckm3eH20TUeJvn4-pj6i8LFOrIK14T3P3GFzbxgQLq1KVm63JWDdEXk789JgzQjHNO7DZFKWTEiktwmBUPUA88TjQcXOtrR5EXTrt1FzGzabOepFann3Ny_XtxI8lDZ3QLwPLJfmk7puGtkGNaXOsRC7GLAnoEB7UWvjiyKG6HAtvVTgxcW5OQnHFb9AHycU5QdukXrP0njdCpLCRR0Nq6VMKmVU3MaGh-DCwYEB32sPNPdDkPDWyk16ItwcmXqfSBV5ZOr8ifvcXbCWUWwIDAQABo4IB5TCCAeEwDgYDVR0PAQH_BAQDAgeAMAwGA1UdEwEB_wQCMAAwbQYDVR0gAQH_BGMwYTBfBgkrBgEEAYI3FR8wUjBQBggrBgEFBQcCAjBEHkIAVABDAFAAQQAgACAAVAByAHUAcwB0AGUAZAAgACAAUABsAGEAdABmAG8AcgBtACAAIABJAGQAZQBuAHQAaQB0AHkwEAYDVR0lBAkwBwYFZ4EFCAMwSgYDVR0RAQH_BEAwPqQ8MDoxODAOBgVngQUCAwwFaWQ6MTMwEAYFZ4EFAgIMB05QQ1Q2eHgwFAYFZ4EFAgEMC2lkOjRFNTQ0MzAwMB8GA1UdIwQYMBaAFMISqVvO-lb4wMFvsVvdAzRHs3qjMB0GA1UdDgQWBBSv4kXTSA8i3NUM0q57lrWpM8p_4TCBswYIKwYBBQUHAQEEgaYwgaMwgaAGCCsGAQUFBzAChoGTaHR0cHM6Ly9hemNzcHJvZG5jdWFpa3B1Ymxpc2guYmxvYi5jb3JlLndpbmRvd3MubmV0L25jdS1udGMta2V5aWQtMTU5MWQ0YjZlYWY5OGQwMTA0ODY0YjY5MDNhNDhkZDAwMjYwNzdkMy8zYjkxOGFlNC0wN2UxLTQwNTktOTQ5MS0wYWQyNDgxOTA4MTguY2VyMA0GCSqGSIb3DQEBCwUAA4IBAQAs-vqdkDX09fNNYqzbv3Lh0vl6RgGpPGl-MYgO8Lg1I9UKvEUaaUHm845ABS8m7r9p22RCWO6TSEPS0YUYzAsNuiKiGVna4nB9JWZaV9GDS6aMD0nJ8kNciorDsV60j0Yb592kv1VkOKlbTF7-Z10jaapx0CqhxEIUzEBb8y9Pa8oOaQf8ORhDHZp-mbn_W8rUzXSDS0rFbWKaW4tGpVoKGRH-f9vIeXxGlxVS0wqqRm_r-h1aZInta0OOiL_S4367gZyeLL3eUnzdd-eYySYn2XINPbVacK8ZifdsLMwiNtz5uM1jbqpEn2UoB3Hcdn0hc12jTLPWFfg7GiKQ0hk9WQXsMIIF6DCCA9CgAwIBAgITMwAAAQDiBsSROVGXhwAAAAABADANBgkqhkiG9w0BAQsFADCBjDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjE2MDQGA1UEAxMtTWljcm9zb2Z0IFRQTSBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDE0MB4XDTE3MDIwMTE3NDAyNFoXDTI5MTIzMTE3NDAyNFowQTE_MD0GA1UEAxM2TkNVLU5UQy1LRVlJRC0xNTkxRDRCNkVBRjk4RDAxMDQ4NjRCNjkwM0E0OEREMDAyNjA3N0QzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9IwUMSiQUbrQR0NLkKR-9RB8zfHYdlmDB0XN_m8qrNHKRJ__lBOR-mwU_h3MFRZF6X3ZZwka1DtwBdzLFV8lVu33bc15stjSd6B22HRRKQ3sIns5AYQxg0eX2PtWCJuIhxdM_jDjP2hq9Yvx-ibt1IO9UZwj83NGxXc7Gk2UvCs9lcFSp6U8zzl5fGFCKYcxIKH0qbPrzjlyVyZTKwGGSTeoMMEdsZiq-m_xIcrehYuHg-FAVaPLLTblS1h5cu80-ruFUm5Xzl61YjVU9tAV_Y4joAsJ5QP3VPocFhr5YVsBVYBiBcQtr5JFdJXZWWEgYcFLdAFUk8nJERS7-5xLuQIDAQABo4IBizCCAYcwCwYDVR0PBAQDAgGGMBsGA1UdJQQUMBIGCSsGAQQBgjcVJAYFZ4EFCAMwFgYDVR0gBA8wDTALBgkrBgEEAYI3FR8wEgYDVR0TAQH_BAgwBgEB_wIBADAdBgNVHQ4EFgQUwhKpW876VvjAwW-xW90DNEezeqMwHwYDVR0jBBgwFoAUeowKzi9IYhfilNGuVcFS7HF0pFYwcAYDVR0fBGkwZzBloGOgYYZfaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVFBNJTIwUm9vdCUyMENlcnRpZmljYXRlJTIwQXV0aG9yaXR5JTIwMjAxNC5jcmwwfQYIKwYBBQUHAQEEcTBvMG0GCCsGAQUFBzAChmFodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRQTSUyMFJvb3QlMjBDZXJ0aWZpY2F0ZSUyMEF1dGhvcml0eSUyMDIwMTQuY3J0MA0GCSqGSIb3DQEBCwUAA4ICAQAKc9z1UUBAaybIVnK8yL1N1iGJFFFFw_PpkxW76hgQhUcCxNFQskfahfFzkBD05odVC1DKyk2PyOle0G86FCmZiJa14MtKNsiu66nVqk2hr8iIcu-cYEsgb446yIGd1NblQKA1C_28F2KHm8YRgcFtRSkWEMuDiVMa0HDU8aI6ZHO04Naj86nXeULJSZsA0pQwNJ04-QJP3MFQzxQ7md6D-pCx-LVA-WUdGxT1ofaO5NFxq0XjubnZwRjQazy_m93dKWp19tbBzTUKImgUKLYGcdmVWXAxUrkxHN2FbZGOYWfmE2TGQXS2Z-g4YAQo1PleyOav3HNB8ti7u5HpI3t9a73xuECy2gFcZQ24DJuBaQe4mU5I_hPiAa-822nPPL6w8m1eegxhHf7ziRW_hW8s1cvAZZ5Jpev96zL_zRv34MsRWhKwLbu2oOCSEYYh8D8DbQZjmsxlUYR_q1cP8JKiIo6NNJ85g7sjTZgXxeanA9wZwqwJB-P98VdVslC17PmVu0RHOqRtxrht7OFT7Z10ecz0tj9ODXrv5nmBktmbgHRirRMl84wp7-PJhTXdHbxZv-OoL4HP6FxyDbHxLB7QmR4-VoEZN0vsybb1A8KEj2pkNY_tmxHH6k87euM99bB8FHrW9FNrXCGL1p6-PYtiky52a5YQZGT8Hz-ZnxobTmhjZXJ0SW5mb1ih_1RDR4AXACIAC7xZ9N_ZpqQtw7hmr_LfDRmCa78BS2erCtbrsXYwa4AHABSsnz8FacZi-wkUkfHu4xjG8MPfmwAAAAGxWkjHaED549jznwUBqeDEpT-7xBMAIgALcSGuv6a5r9BwMvQvCSXg7GdAjdWZpXv6D4DH8VYBCE8AIgALAVI0eQ_AAZjNvrhUEMK2q4wxuwIFOnHIDF0Qljhf47RncHViQXJlYVkBNgABAAsABgRyACCd_8vzbDg65pn7mGjcbcuJ1xU4hL4oA5IsEkFYv60irgAQABAIAAAAAAABAMXab02TV73iAvXFWM0KMVbSVPLgrZq1eTH5gmt0feGsTynWBwh03OV5EOGYREmdjkJHAzmxcNAitQGriOnC9O0wLkcZxw3r6IQkA-2b38InMKYaG3D2FsXxtwDKz3hGE33EstRpqOFaq0-thlcIQCLSj0TZB1MjEmtwB8mBk5_fckyvT75HUEBDGk6gZEMLyyz619Bb259ktbDglS7PhnknPWxt-oFgHxRQMxahPQeCwxo-a93tPXvEa8H6m-8N_4O33q8Ua1gsRkSCGjxi7bqmvkIr8E5D7a9f03gwhhU9c2GiAwYaYpirJuEzfKHJ7QZ0GlkFR3mI5yAwTq4YnX8"
        }
    };

    var challengeResponseAttestationSafetyNetMsgB64Url = {
        "rawId": "qCXEfJ-dEoBlWqIl0iq2p_gj13HSg7r_MA7xOcOiO8RkCrYNmQHIjV9yhZVASr87cUsflo7DNuuvGsnrlTl1ig",
        "id": "qCXEfJ-dEoBlWqIl0iq2p_gj13HSg7r_MA7xOcOiO8RkCrYNmQHIjV9yhZVASr87cUsflo7DNuuvGsnrlTl1ig",
        "response": {
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJEa1hCdWRCa2wzTzBlTUV5SGZBTVgxT2tRbHV4c2hjaW9WU3dITVJMUlhtd044SXJldHg3cWJ0MWx3Y0p4d0FxWUU0SUxTZjVwd3lHMEhXSWtEekVMUT09Iiwib3JpZ2luIjoid2ViYXV0aG4ub3JnIiwiaGFzaEFsZyI6IlNIQS0yNTYifQ",
            "attestationObject": "o2hhdXRoRGF0YVjElWkIjx7O4yMpVANdvRDXyuORMFonUbVZu4_Xy7IpvdRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQKglxHyfnRKAZVqiJdIqtqf4I9dx0oO6_zAO8TnDojvEZAq2DZkByI1fcoWVQEq_O3FLH5aOwzbrrxrJ65U5dYqlAQIDJiABIVggh5OJfYRDzVGIowKqU57AnoVjjdmmjGi9zlMkjAVV9DAiWCDr0iSi0viIKNPMTIdN28gWNmkcwOr6DQx66MPff3Odm2NmbXRxYW5kcm9pZC1zYWZldHluZXRnYXR0U3RtdKJjdmVyaDEyNjg1MDIzaHJlc3BvbnNlWRSnZXlKaGJHY2lPaUpTVXpJMU5pSXNJbmcxWXlJNld5Sk5TVWxGYVdwRFEwRXpTMmRCZDBsQ1FXZEpTVmxyV1c4MVJqQm5PRFpyZDBSUldVcExiMXBKYUhaalRrRlJSVXhDVVVGM1ZrUkZURTFCYTBkQk1WVkZRbWhOUTFaV1RYaElha0ZqUW1kT1ZrSkJiMVJHVldSMllqSmtjMXBUUWxWamJsWjZaRU5DVkZwWVNqSmhWMDVzWTNwRmJFMURUVWRCTVZWRlFYaE5ZMUl5T1haYU1uaHNTVVZzZFdSSFZubGliVll3U1VWR01XUkhhSFpqYld3d1pWTkNTRTE2UVdWR2R6QjRUbnBGZVUxRVVYaE5la1UwVGtST1lVWjNNSGhQUkVWNVRVUk5kMDFFUVhkTlJFSmhUVWQzZUVONlFVcENaMDVXUWtGWlZFRnNWbFJOVWsxM1JWRlpSRlpSVVVsRVFYQkVXVmQ0Y0ZwdE9YbGliV3hvVFZKWmQwWkJXVVJXVVZGSVJFRXhUbUl6Vm5Wa1IwWndZbWxDVjJGWFZqTk5VazEzUlZGWlJGWlJVVXRFUVhCSVlqSTVibUpIVldkVFZ6VnFUVkp6ZDBkUldVUldVVkZFUkVKS2FHUklVbXhqTTFGMVdWYzFhMk50T1hCYVF6VnFZakl3ZDJkblJXbE5RVEJIUTFOeFIxTkpZak5FVVVWQ1FWRlZRVUUwU1VKRWQwRjNaMmRGUzBGdlNVSkJVVU5WYWpoM1dXOVFhWGhMWW1KV09ITm5XV2QyVFZSbVdDdGtTWE5HVkU5clowdFBiR2hVTUdrd1ltTkVSbHBMTW5KUGVFcGFNblZUVEZOV2FGbDJhWEJhVGtVelNFcFJXWFYxV1hkR2FtbDVLM2xyWm1GMFFVZFRhbEo2UmpGaU16RjFORE12TjI5SE5XcE5hRE5UTXpkaGJIZHFWV0k0UTFkcFZIaHZhWEJXVDFsM1MwdDZkVlY1YTNGRlEzUnFiR2hLTkVGclYyRkVVeXRhZUV0RmNVOWhaVGwwYmtOblpVaHNiRnBGTDA5U1oyVk5ZWGd5V0U1RGIwZzJjM0pVUlZKamEzTnFlbHBhY2tGWGVFdHpaR1oyVm5KWVRucERVamxFZUZaQlUzVkpOa3g2ZDJnNFJGTnNNa1ZQYjJ0aWMyRnVXaXNyTDBweFRXVkJRa1ptVUhkcWVYZHlZakJ3Y2tWVmVUQndZV1ZXYzNWa0t6QndaV1Y0U3k4MUswVTJhM0JaUjBzMFdrc3libXR2Vmt4MVowVTFkR0ZJY2tGcU9ETlJLMUJQWW1KMlQzcFhZMFpyY0c1V1MzbHFielpMVVVGdFdEWlhTa0ZuVFVKQlFVZHFaMmRHUjAxSlNVSlJha0ZVUW1kT1ZraFRWVVZFUkVGTFFtZG5ja0puUlVaQ1VXTkVRVlJCWkVKblRsWklVa1ZGUm1wQlZXZG9TbWhrU0ZKc1l6TlJkVmxYTld0amJUbHdXa00xYW1JeU1IZGhRVmxKUzNkWlFrSlJWVWhCVVVWRldFUkNZVTFETUVkRFEzTkhRVkZWUmtKNlFVTm9hVVp2WkVoU2QwOXBPSFpqUjNSd1RHMWtkbUl5WTNaYU0wNTVUV2s1U0ZaR1RraFRWVVpJVFhrMWFtTnVVWGRMVVZsSlMzZFpRa0pSVlVoTlFVZEhTRmRvTUdSSVFUWk1lVGwyV1ROT2QweHVRbkpoVXpWdVlqSTVia3d3WkZWVk1HUktVVlZqZWsxQ01FZEJNVlZrUkdkUlYwSkNVVWM0U1hKUmRFWlNOa05WVTJ0cGEySXpZV2x0YzIweU5tTkNWRUZOUW1kT1ZraFNUVUpCWmpoRlFXcEJRVTFDT0VkQk1WVmtTWGRSV1UxQ1lVRkdTR1pEZFVaRFlWb3pXakp6VXpORGFIUkRSRzlJTm0xbWNuQk1UVU5GUjBFeFZXUkpRVkZoVFVKbmQwUkJXVXRMZDFsQ1FrRklWMlZSU1VaQmVrRkpRbWRhYm1kUmQwSkJaMGwzVFZGWlJGWlNNR1pDUTI5M1MwUkJiVzlEVTJkSmIxbG5ZVWhTTUdORWIzWk1NazU1WWtNMWQyRXlhM1ZhTWpsMlduazVTRlpHVGtoVFZVWklUWGsxYW1OdGQzZEVVVmxLUzI5YVNXaDJZMDVCVVVWTVFsRkJSR2RuUlVKQlJpOVNlazV1UXpWRWVrSlZRblJ1YURKdWRFcE1WMFZSYURsNlJXVkdXbVpRVERsUmIydHliRUZ2V0dkcVYyZE9PSEJUVWxVeGJGWkhTWEIwZWsxNFIyaDVNeTlQVWxKYVZHRTJSREpFZVRob2RrTkVja1pKTXl0c1Exa3dNVTFNTlZFMldFNUZOVkp6TW1ReFVtbGFjRTF6ZWtRMFMxRmFUa2N6YUZvd1FrWk9VUzlqYW5KRGJVeENUMGRMYTBWVk1XUnRRVmh6UmtwWVNtbFBjakpEVGxSQ1QxUjFPVVZpVEZkb1VXWmtRMFl4WW5kNmVYVXJWelppVVZOMk9GRkVialZQWkUxVEwxQnhSVEZrUldkbGRDODJSVWxTUWpjMk1VdG1XbEVyTDBSRk5reHdNMVJ5V2xSd1QwWkVSR2RZYUN0TVowZFBjM2RvUld4cU9XTXpkbHBJUjBwdWFHcHdkRGh5YTJKcGNpOHlkVXhIWm5oc1ZsbzBTekY0TlVSU1RqQlFWVXhrT1hsUVUyMXFaeXRoYWpFcmRFaDNTVEZ0VVcxYVZsazNjWFpQTlVSbmFFOTRhRXBOUjJ4Nk5teE1hVnB0ZW05blBTSXNJazFKU1VWWVJFTkRRVEJUWjBGM1NVSkJaMGxPUVdWUGNFMUNlamhqWjFrMFVEVndWRWhVUVU1Q1oydHhhR3RwUnpsM01FSkJVWE5HUVVSQ1RVMVRRWGRJWjFsRVZsRlJURVY0WkVoaVJ6bHBXVmQ0VkdGWFpIVkpSa3AyWWpOUloxRXdSV2RNVTBKVFRXcEZWRTFDUlVkQk1WVkZRMmhOUzFJeWVIWlpiVVp6VlRKc2JtSnFSVlJOUWtWSFFURlZSVUY0VFV0U01uaDJXVzFHYzFVeWJHNWlha0ZsUm5jd2VFNTZRVEpOVkZWM1RVUkJkMDVFU21GR2R6QjVUVlJGZVUxVVZYZE5SRUYzVGtSS1lVMUdVWGhEZWtGS1FtZE9Wa0pCV1ZSQmJGWlVUVkkwZDBoQldVUldVVkZMUlhoV1NHSXlPVzVpUjFWblZraEtNV016VVdkVk1sWjVaRzFzYWxwWVRYaEtWRUZxUW1kT1ZrSkJUVlJJUldSMllqSmtjMXBUUWtwaWJsSnNZMjAxYkdSRFFrSmtXRkp2WWpOS2NHUklhMmRTZWsxM1oyZEZhVTFCTUVkRFUzRkhVMGxpTTBSUlJVSkJVVlZCUVRSSlFrUjNRWGRuWjBWTFFXOUpRa0ZSUkV0VmEzWnhTSFl2VDBwSGRXOHlia2xaWVU1V1YxaFJOVWxYYVRBeFExaGFZWG8yVkVsSVRFZHdMMnhQU2lzMk1EQXZOR2hpYmpkMmJqWkJRVUl6UkZaNlpGRlBkSE0zUnpWd1NEQnlTbTV1VDBaVlFVczNNVWMwYm5wTFRXWklRMGRWYTNOWEwyMXZibUVyV1RKbGJVcFJNazRyWVdsamQwcExaWFJRUzFKVFNXZEJkVkJQUWpaQllXaG9PRWhpTWxoUE0yZzVVbFZyTWxRd1NFNXZkVUl5Vm5wNGIwMVliR3Q1VnpkWVZWSTFiWGMyU210TVNHNUJOVEpZUkZadlVsUlhhMDUwZVRWdlEwbE9USFpIYlc1U2Mwb3hlbTkxUVhGWlIxWlJUV012TjNONUt5OUZXV2hCVEhKV1NrVkJPRXRpZEhsWUszSTRjMjUzVlRWRE1XaFZjbmRoVnpaTlYwOUJVbUU0Y1VKd1RsRmpWMVJyWVVsbGIxbDJlUzl6UjBsS1JXMXFVakIyUmtWM1NHUndNV05UWVZkSmNqWXZOR2MzTW00M1QzRllkMlpwYm5VM1dsbFhPVGRGWm05UFUxRktaVUY2UVdkTlFrRkJSMnBuWjBWNlRVbEpRa3g2UVU5Q1owNVdTRkU0UWtGbU9FVkNRVTFEUVZsWmQwaFJXVVJXVWpCc1FrSlpkMFpCV1VsTGQxbENRbEZWU0VGM1JVZERRM05IUVZGVlJrSjNUVU5OUWtsSFFURlZaRVYzUlVJdmQxRkpUVUZaUWtGbU9FTkJVVUYzU0ZGWlJGWlNNRTlDUWxsRlJraG1RM1ZHUTJGYU0xb3ljMU16UTJoMFEwUnZTRFp0Wm5Kd1RFMUNPRWRCTVZWa1NYZFJXVTFDWVVGR1NuWnBRakZrYmtoQ04wRmhaMkpsVjJKVFlVeGtMMk5IV1ZsMVRVUlZSME5EYzBkQlVWVkdRbmRGUWtKRGEzZEtla0ZzUW1kbmNrSm5SVVpDVVdOM1FWbFpXbUZJVWpCalJHOTJUREk1YW1NelFYVmpSM1J3VEcxa2RtSXlZM1phTTA1NVRXcEJlVUpuVGxaSVVqaEZTM3BCY0UxRFpXZEtZVUZxYUdsR2IyUklVbmRQYVRoMldUTktjMHh1UW5KaFV6VnVZakk1Ymt3eVpIcGpha2wyV2pOT2VVMXBOV3BqYlhkM1VIZFpSRlpTTUdkQ1JHZDNUbXBCTUVKbldtNW5VWGRDUVdkSmQwdHFRVzlDWjJkeVFtZEZSa0pSWTBOQlVsbGpZVWhTTUdOSVRUWk1lVGwzWVRKcmRWb3lPWFphZVRsNVdsaENkbU15YkRCaU0wbzFUSHBCVGtKbmEzRm9hMmxIT1hjd1FrRlJjMFpCUVU5RFFWRkZRVWhNWlVwc2RWSlVOMkoyY3pJMlozbEJXamh6YnpneGRISlZTVk5rTjA4ME5YTnJSRlZ0UVdkbE1XTnVlR2hITVZBeVkwNXRVM2hpVjNOdmFVTjBNbVYxZURsTVUwUXJVRUZxTWt4SldWSkdTRmN6TVM4MmVHOXBZekZyTkhSaVYxaHJSRU5xYVhJek4zaFVWRTV4VWtGTlVGVjVSbEpYVTJSMmRDdHViRkJ4ZDI1aU9FOWhNa2t2YldGVFNuVnJZM2hFYWs1VFpuQkVhQzlDWkRGc1drNW5aR1F2T0dOTVpITkZNeXQzZVhCMVprbzVkVmhQTVdsUmNHNW9PWHBpZFVaSmQzTkpUMDVIYkRGd00wRTRRMmQ0YTNGSkwxVkJhV2d6U21GSFQzRmpjR05rWVVOSmVtdENZVkk1ZFZsUk1WZzBhekpXWnpWQlVGSk1iM1Y2Vm5rM1lUaEpWbXMyZDNWNU5uQnRLMVEzU0ZRMFRGazRhV0pUTlVaRldteG1RVVpNVTFjNFRuZHpWbm81VTBKTE1sWnhiakZPTUZCSlRXNDFlRUUyVGxwV1l6ZHZPRE0xUkV4QlJuTm9SVmRtUXpkVVNXVXpaejA5SWwxOS5leUp1YjI1alpTSTZJbXhYYTBscWVEZFBOSGxOY0ZaQlRtUjJVa1JZZVhWUFVrMUdiMjVWWWxaYWRUUXZXSGszU1hCMlpGSkJRVUZCUVVGQlFVRkJRVUZCUVVGQlFVRkJRVUZCUVVGQlFVRkJRVkZMWjJ4NFNIbG1ibEpMUVZwV2NXbEtaRWx4ZEhGbU5FazVaSGd3YjA4MkwzcEJUemhVYmtSdmFuWkZXa0Z4TWtSYWEwSjVTVEZtWTI5WFZsRkZjUzlQTTBaTVNEVmhUM2Q2WW5KeWVISktOalZWTldSWmNXeEJVVWxFU21sQlFrbFdaMmRvTlU5S1psbFNSSHBXUjBsdmQwdHhWVFUzUVc1dlZtcHFaRzF0YWtkcE9YcHNUV3RxUVZaV09VUkJhVmREUkhJd2FWTnBNSFpwU1V0T1VFMVVTV1JPTWpoblYwNXRhMk4zVDNJMlJGRjROalpOVUdabU0wOWtiU3QxTm1WS2NVeENiREZJTWxNeWRISkJRa2hNYVc1cmJuTjVWazFRYlM5Q1RsVldXakpLUm14eU9EQWlMQ0owYVcxbGMzUmhiWEJOY3lJNk1UVXlPRGt4TVRZek5ETTROU3dpWVhCclVHRmphMkZuWlU1aGJXVWlPaUpqYjIwdVoyOXZaMnhsTG1GdVpISnZhV1F1WjIxeklpd2lZWEJyUkdsblpYTjBVMmhoTWpVMklqb2lTazlETTFWcmMyeHpkVlo2TVRObFQzQnVSa2s1UW5CTWIzRkNaemxyTVVZMlQyWmhVSFJDTDBkcVRUMGlMQ0pqZEhOUWNtOW1hV3hsVFdGMFkyZ2lPbVpoYkhObExDSmhjR3REWlhKMGFXWnBZMkYwWlVScFoyVnpkRk5vWVRJMU5pSTZXeUpIV0ZkNU9GaEdNM1pKYld3ekwwMW1ibTFUYlhsMVMwSndWRE5DTUdSWFlraFNVaTgwWTJkeEsyZEJQU0pkTENKaVlYTnBZMGx1ZEdWbmNtbDBlU0k2Wm1Gc2MyVXNJbUZrZG1salpTSTZJbEpGVTFSUFVrVmZWRTlmUmtGRFZFOVNXVjlTVDAwc1RFOURTMTlDVDA5VVRFOUJSRVZTSW4wLmlDRjZEMm9zOERZdURWT250M3pESkIybVNYblpqdFdKdGxfanpTRHg1TXJSQzlBMmZtRkJaNno1a3BRWjJNaVE3b290ajlXa0hNZ3hxSWhyWDNkbGgyUE9IQXdrSVMzNHlTakxWTnNTUHByRTg0ZVpncVNGTE1FWVQwR1IyZVZMSEFNUE44bjVSOEs2YnVET0dGM25TaTZHS3pHNTdabGw4Q1NvYjJ5aUFTOXI3c3BkQTZIMFRESC1OR3pTZGJNSUlkOGZaRDFkekZLTlFyNzdiNmxiSUFGZ1FiUlpCcm5wLWUtSDRpSDZkMjFvTjJOQVlSblI1WVVSYWNQNmtHR2oyY0Z4c3dFMjkwOHd4djloaVlOS05vamVldThYYzRJdDdQYmhsQXVPN3l3aFFGQTgxaVBDQ0ZtMTFCOGNmVVhiV0E4bF8ydHROUEJFTUdNNi1aNlZ5UQ"
        }
    };

    var assertionResponseMsgB64Url = {
        "rawId": "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
        "id": "AAhH7cnPRBkcukjnc2G2GM1H5dkVs9P1q2VErhD57pkzKVjBbixdsufjXhUOfiD27D0VA-fPKUVYNGE2XYcjhihtYODQv-xEarplsa7Ix6hK13FA6uyRxMgHC3PhTbx-rbq_RMUbaJ-HoGVt-c820ifdoagkFR02Van8Vr9q67Bn6zHNDT_DNrQbtpIUqqX_Rg2p5o6F7bVO3uOJG9hUNgUb",
        "response": {
            "clientDataJSON": "eyJjaGFsbGVuZ2UiOiJlYVR5VU5ueVBERGRLOFNORWdURVV2ejFROGR5bGtqalRpbVlkNVg3UUFvLUY4X1oxbHNKaTNCaWxVcEZaSGtJQ05EV1k4cjlpdm5UZ1c3LVhaQzNxUSIsImNsaWVudEV4dGVuc2lvbnMiOnt9LCJoYXNoQWxnb3JpdGhtIjoiU0hBLTI1NiIsIm9yaWdpbiI6Imh0dHBzOi8vbG9jYWxob3N0Ojg0NDMiLCJ0eXBlIjoid2ViYXV0aG4uZ2V0In0=",
            "authenticatorData": "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MBAAABaw==",
            "signature": "MEYCIQD6dF3B0ZoaLA0r78oyRdoMNR0bN93Zi4cF_75hFAH6pQIhALY0UIsrh03u_f4yKOwzwD6Cj3_GWLJiioTT9580s1a7",
            "userHandle": ""
        }
    };

    var assertionResponseWindowsHelloMsgB64Url = {
        "rawId": "AwVUFfSwuMV1DRHfYmNry1IUGW03wEw9aTAR7kJM1nw",
        "id": "AwVUFfSwuMV1DRHfYmNry1IUGW03wEw9aTAR7kJM1nw",
        "response": {
            "clientDataJSON": "ew0KCSJ0eXBlIiA6ICJ3ZWJhdXRobi5nZXQiLA0KCSJjaGFsbGVuZ2UiIDogIm03WlUwWi1fSWl3dmlGbkYxSlhlSmpGaFZCaW5jVzY5RTFDdGo4QVEtWWJiMXVjNDFiTUh0SXRnNkpBQ2gxc09qX1pYam9udzJhY2pfSkQyaS1heEVRIiwNCgkib3JpZ2luIiA6ICJodHRwczovL3dlYmF1dGhuLm9yZyIsDQoJInRva2VuQmluZGluZyIgOiANCgl7DQoJCSJzdGF0dXMiIDogInN1cHBvcnRlZCINCgl9DQp9",
            "authenticatorData": "lWkIjx7O4yMpVANdvRDXyuORMFonUbVZu4_Xy7IpvdQFAAAAAQ",
            "signature": "ElyXBPkS6ps0aod8pSEwdbaeG04SUSoucEHaulPrK3eBk3R4aePjTB-SjiPbya5rxzbuUIYO0UnqkpZrb19ZywWqwQ7qVxZzxSq7BCZmJhcML7j54eK_2nszVwXXVgO7WxpBcy_JQMxjwjXw6wNAxmnJ-H3TJJO82x4-9pDkno-GjUH2ObYk9NtkgylyMcENUaPYqajSLX-q5k14T2g839UC3xzsg71xHXQSeHgzPt6f3TXpNxNNcBYJAMm8-exKsoMkxHPDLkzK1wd5giietdoT25XQ72i8fjSSL8eiS1gllEjwbqLJn5zMQbWlgpSzJy3lK634sdeZtmMpXbRtMA",
            "userHandle": "YWs"
        }
    };

    var successServerResponse = {
        status: "ok",
        errorMessage: ""
    };

    var errorServerResponse = {
        status: "failed",
        errorMessage: "out of memory"
    };

    var server = {
        creationOptionsRequest,
        basicCreationOptions,
        completeCreationOptions,
        getOptionsRequest,
        challengeResponseAttestationNoneMsgB64Url,
        challengeResponseAttestationU2fMsgB64Url,
        challengeResponseAttestationU2fHypersecuB64UrlMsg,
        challengeResponseAttestationPackedB64UrlMsg,
        challengeResponseAttestationTpmB64UrlMsg,
        challengeResponseAttestationSafetyNetMsgB64Url,
        basicGetOptions,
        completeGetOptions,
        assertionResponseMsgB64Url,
        assertionResponseWindowsHelloMsgB64Url,
        successServerResponse,
        errorServerResponse
    };

    /********************************************************************************
     *********************************************************************************
     * LIB PARAMS
     *********************************************************************************
     *********************************************************************************/

    var makeCredentialAttestationNoneResponse = {
        username: challengeResponseAttestationNoneMsgB64Url.username,
        rawId: b64decode(challengeResponseAttestationNoneMsgB64Url.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationNoneMsgB64Url.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationNoneMsgB64Url.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationU2fResponse = {
        username: challengeResponseAttestationU2fMsgB64Url.username,
        rawId: b64decode(challengeResponseAttestationU2fMsgB64Url.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationU2fMsgB64Url.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationU2fMsgB64Url.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationHypersecuU2fResponse = {
        rawId: b64decode(challengeResponseAttestationU2fHypersecuB64UrlMsg.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationU2fHypersecuB64UrlMsg.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationU2fHypersecuB64UrlMsg.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationPackedResponse = {
        rawId: b64decode(challengeResponseAttestationPackedB64UrlMsg.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationPackedB64UrlMsg.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationPackedB64UrlMsg.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationTpmResponse = {
        rawId: b64decode(challengeResponseAttestationTpmB64UrlMsg.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationTpmB64UrlMsg.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationTpmB64UrlMsg.response.clientDataJSON)
        }
    };

    var makeCredentialAttestationSafetyNetResponse = {
        rawId: b64decode(challengeResponseAttestationSafetyNetMsgB64Url.rawId),
        response: {
            attestationObject: b64decode(challengeResponseAttestationSafetyNetMsgB64Url.response.attestationObject),
            clientDataJSON: b64decode(challengeResponseAttestationSafetyNetMsgB64Url.response.clientDataJSON)
        }
    };

    var assertionResponse = {
        id: assertionResponseMsgB64Url.id,
        rawId: b64decode(assertionResponseMsgB64Url.rawId),
        response: {
            clientDataJSON: b64decode(assertionResponseMsgB64Url.response.clientDataJSON),
            authenticatorData: b64decode(assertionResponseMsgB64Url.response.authenticatorData),
            signature: b64decode(assertionResponseMsgB64Url.response.signature),
            userHandle: assertionResponseMsgB64Url.response.userHandle
        }
    };

    var assertionResponseWindowsHello = {
        rawId: b64decode(assertionResponseWindowsHelloMsgB64Url.rawId),
        response: {
            clientDataJSON: b64decode(assertionResponseWindowsHelloMsgB64Url.response.clientDataJSON),
            authenticatorData: b64decode(assertionResponseWindowsHelloMsgB64Url.response.authenticatorData),
            signature: b64decode(assertionResponseWindowsHelloMsgB64Url.response.signature),
            userHandle: assertionResponseWindowsHelloMsgB64Url.response.userHandle
        }
    };

    var assnPublicKey =
        "-----BEGIN PUBLIC KEY-----\n" +
        "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAERez9aO2wBAWO54MuGbEqSdWahSnG\n" +
        "MAg35BCNkaE3j8Q+O/ZhhKqTeIKm7El70EG6ejt4sg1ZaoQ5ELg8k3ywTg==\n" +
        "-----END PUBLIC KEY-----\n";

    var assnPublicKeyWindowsHello =
        "-----BEGIN PUBLIC KEY-----\n" +
        "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2zT9pxqfMK3SNWvasEpd\n" +
        "5/IcnjKGUJcUOGWjNJ3oszlvOlkpiWjCwYqnVH0Fy4ohm0rGzOOw4kyQh6i/X2qX\n" +
        "dA0C2UNpuq29wpLBxl5ZiePVpnetJJVFRKiwA9WoDvlU3zX7QpFKzbEeRKSmI9r0\n" +
        "gvJfCPOYWDhmiYxRZ4/u8hfSQ/Qg7NiV0K7jLv1m/2qtPEHVko7UGmXjWk0KANNe\n" +
        "Xi2bwhQTU938I5aXtUQzDaURHbxCpmm86sKNgOWT1CVOGMuRqHBdyt5qKeu5N0DB\n" +
        "aRFRRFVkcx6N0fU8y7DHXYnry0T+2Ln8rDZMZrfjQ/+b48CibGU9GwomshQE32pt\n" +
        "/QIDAQAB\n" +
        "-----END PUBLIC KEY-----\n";

    var lib = {
        makeCredentialAttestationNoneResponse,
        makeCredentialAttestationU2fResponse,
        makeCredentialAttestationHypersecuU2fResponse,
        makeCredentialAttestationPackedResponse,
        makeCredentialAttestationTpmResponse,
        makeCredentialAttestationSafetyNetResponse,
        assertionResponse,
        assertionResponseWindowsHello,
        assnPublicKey,
        assnPublicKeyWindowsHello,
    };

    /********************************************************************************
     *********************************************************************************
     * CERTS
     *********************************************************************************
     *********************************************************************************/

    var yubiKeyAttestation = new Uint8Array([
        0x30, 0x82, 0x02, 0x44, 0x30, 0x82, 0x01, 0x2E, 0xA0, 0x03, 0x02, 0x01, 0x02, 0x02, 0x04, 0x55,
        0x62, 0xBE, 0xA0, 0x30, 0x0B, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x0B,
        0x30, 0x2E, 0x31, 0x2C, 0x30, 0x2A, 0x06, 0x03, 0x55, 0x04, 0x03, 0x13, 0x23, 0x59, 0x75, 0x62,
        0x69, 0x63, 0x6F, 0x20, 0x55, 0x32, 0x46, 0x20, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x43, 0x41, 0x20,
        0x53, 0x65, 0x72, 0x69, 0x61, 0x6C, 0x20, 0x34, 0x35, 0x37, 0x32, 0x30, 0x30, 0x36, 0x33, 0x31,
        0x30, 0x20, 0x17, 0x0D, 0x31, 0x34, 0x30, 0x38, 0x30, 0x31, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x5A, 0x18, 0x0F, 0x32, 0x30, 0x35, 0x30, 0x30, 0x39, 0x30, 0x34, 0x30, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x5A, 0x30, 0x2A, 0x31, 0x28, 0x30, 0x26, 0x06, 0x03, 0x55, 0x04, 0x03, 0x0C, 0x1F, 0x59,
        0x75, 0x62, 0x69, 0x63, 0x6F, 0x20, 0x55, 0x32, 0x46, 0x20, 0x45, 0x45, 0x20, 0x53, 0x65, 0x72,
        0x69, 0x61, 0x6C, 0x20, 0x31, 0x34, 0x33, 0x32, 0x35, 0x33, 0x34, 0x36, 0x38, 0x38, 0x30, 0x59,
        0x30, 0x13, 0x06, 0x07, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01, 0x06, 0x08, 0x2A, 0x86, 0x48,
        0xCE, 0x3D, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00, 0x04, 0x4B, 0x33, 0x1F, 0x77, 0x3D, 0x81, 0x44,
        0xB9, 0x99, 0x5C, 0xBE, 0x45, 0x85, 0x51, 0x7E, 0x17, 0x58, 0x3A, 0xA4, 0x76, 0x23, 0x69, 0x5C,
        0xBE, 0x85, 0xAC, 0x48, 0x2C, 0x80, 0x19, 0xF2, 0xC9, 0xB9, 0x46, 0x7A, 0xE0, 0x45, 0xB0, 0xE6,
        0x6F, 0x13, 0x1B, 0x2E, 0xA3, 0x24, 0x3C, 0x91, 0xFD, 0xA6, 0x02, 0xE3, 0x18, 0xF3, 0xFC, 0x5D,
        0x8D, 0x2A, 0x7A, 0xBA, 0xE7, 0x2B, 0xD1, 0x43, 0x09, 0xA3, 0x3B, 0x30, 0x39, 0x30, 0x22, 0x06,
        0x09, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x82, 0xC4, 0x0A, 0x02, 0x04, 0x15, 0x31, 0x2E, 0x33, 0x2E,
        0x36, 0x2E, 0x31, 0x2E, 0x34, 0x2E, 0x31, 0x2E, 0x34, 0x31, 0x34, 0x38, 0x32, 0x2E, 0x31, 0x2E,
        0x35, 0x30, 0x13, 0x06, 0x0B, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x82, 0xE5, 0x1C, 0x02, 0x01, 0x01,
        0x04, 0x04, 0x03, 0x02, 0x05, 0x20, 0x30, 0x0B, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D,
        0x01, 0x01, 0x0B, 0x03, 0x82, 0x01, 0x01, 0x00, 0xAC, 0x16, 0xD9, 0xB3, 0x6E, 0xB6, 0xB3, 0xA9,
        0xB7, 0x6D, 0x75, 0x94, 0xB3, 0x4F, 0x59, 0xF4, 0xF7, 0x3E, 0xDB, 0xC9, 0xFD, 0xEB, 0x29, 0x35,
        0xEB, 0x6B, 0x45, 0x1C, 0xAB, 0xF4, 0x1D, 0x25, 0xD3, 0xE7, 0x16, 0x14, 0xD7, 0x47, 0x26, 0x04,
        0xCA, 0x72, 0xA5, 0x78, 0xE3, 0x23, 0xED, 0xB7, 0x60, 0x04, 0x68, 0x5F, 0x05, 0xE7, 0xD1, 0xB9,
        0xBE, 0x05, 0xDB, 0x6E, 0x94, 0x40, 0xFA, 0xC5, 0xCF, 0xC9, 0x32, 0xA6, 0xCA, 0xFA, 0xE8, 0x52,
        0x99, 0x77, 0x2E, 0xDB, 0x02, 0x78, 0x20, 0x20, 0x3C, 0xD4, 0x14, 0x1D, 0x3E, 0xEB, 0x6F, 0x6A,
        0x2C, 0xE9, 0x9E, 0x39, 0x57, 0x80, 0x32, 0x63, 0xAB, 0xAB, 0x8D, 0x6E, 0xC4, 0x80, 0xA7, 0xDF,
        0x08, 0x4A, 0xD2, 0xCB, 0xA7, 0xB7, 0xD6, 0xD7, 0x7C, 0x94, 0xC3, 0xEB, 0xC0, 0xB1, 0x66, 0xF9,
        0x60, 0x57, 0xCA, 0xF5, 0xFE, 0x3A, 0x63, 0x1E, 0xA2, 0x6A, 0x43, 0x37, 0x62, 0xA3, 0x6F, 0xBE,
        0xCF, 0x4C, 0xF4, 0x45, 0x09, 0x62, 0x5F, 0xD5, 0xAF, 0x10, 0x49, 0xAA, 0x7C, 0x8B, 0xC7, 0x68,
        0x9A, 0x66, 0x59, 0xE9, 0xAF, 0x5D, 0xE8, 0xF0, 0xD7, 0x2C, 0x28, 0x82, 0x51, 0x74, 0xC5, 0x0E,
        0x06, 0xAB, 0x7F, 0x6A, 0x07, 0x90, 0x83, 0x7B, 0x6D, 0xB3, 0x2A, 0xBF, 0xDC, 0xBC, 0xA8, 0x35,
        0xCB, 0xBB, 0x09, 0x0E, 0xF1, 0xF0, 0xD9, 0x9E, 0x08, 0x69, 0xBF, 0xE9, 0xE5, 0x67, 0x64, 0xC4,
        0x23, 0x0E, 0x6C, 0x05, 0x77, 0x29, 0xB0, 0x10, 0xDE, 0x0E, 0xC5, 0xF9, 0xCC, 0xE4, 0xC9, 0x1C,
        0x28, 0x26, 0x21, 0x8E, 0xA8, 0x08, 0x1A, 0xBB, 0x96, 0x91, 0x51, 0xEC, 0x16, 0x72, 0x5A, 0xF2,
        0xA8, 0xD9, 0x5E, 0x77, 0x95, 0xBC, 0xAA, 0x22, 0x7A, 0x9B, 0x94, 0x43, 0x20, 0xC4, 0x27, 0x61,
        0x9C, 0xAA, 0xF8, 0x54, 0xD9, 0x82, 0x98, 0xD7
    ]).buffer;

    var yubicoRoot = new Uint8Array([
        0x30, 0x82, 0x03, 0x1e, 0x30, 0x82, 0x02, 0x06, 0xa0, 0x03, 0x02, 0x01, 0x02, 0x02, 0x04, 0x1b,
        0x40, 0x53, 0xf7, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b,
        0x05, 0x00, 0x30, 0x2e, 0x31, 0x2c, 0x30, 0x2a, 0x06, 0x03, 0x55, 0x04, 0x03, 0x13, 0x23, 0x59,
        0x75, 0x62, 0x69, 0x63, 0x6f, 0x20, 0x55, 0x32, 0x46, 0x20, 0x52, 0x6f, 0x6f, 0x74, 0x20, 0x43,
        0x41, 0x20, 0x53, 0x65, 0x72, 0x69, 0x61, 0x6c, 0x20, 0x34, 0x35, 0x37, 0x32, 0x30, 0x30, 0x36,
        0x33, 0x31, 0x30, 0x20, 0x17, 0x0d, 0x31, 0x34, 0x30, 0x38, 0x30, 0x31, 0x30, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x5a, 0x18, 0x0f, 0x32, 0x30, 0x35, 0x30, 0x30, 0x39, 0x30, 0x34, 0x30, 0x30, 0x30,
        0x30, 0x30, 0x30, 0x5a, 0x30, 0x2e, 0x31, 0x2c, 0x30, 0x2a, 0x06, 0x03, 0x55, 0x04, 0x03, 0x13,
        0x23, 0x59, 0x75, 0x62, 0x69, 0x63, 0x6f, 0x20, 0x55, 0x32, 0x46, 0x20, 0x52, 0x6f, 0x6f, 0x74,
        0x20, 0x43, 0x41, 0x20, 0x53, 0x65, 0x72, 0x69, 0x61, 0x6c, 0x20, 0x34, 0x35, 0x37, 0x32, 0x30,
        0x30, 0x36, 0x33, 0x31, 0x30, 0x82, 0x01, 0x22, 0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86,
        0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00, 0x03, 0x82, 0x01, 0x0f, 0x00, 0x30, 0x82, 0x01, 0x0a,
        0x02, 0x82, 0x01, 0x01, 0x00, 0xbf, 0x8f, 0x06, 0x2e, 0x84, 0x15, 0x65, 0xa9, 0xa8, 0x98, 0x58,
        0x43, 0x2c, 0xad, 0x61, 0x62, 0xb2, 0x02, 0x7e, 0x3e, 0xd3, 0x3d, 0xd5, 0xe4, 0xab, 0xa4, 0x8e,
        0x13, 0x2b, 0xb5, 0x39, 0xde, 0x6c, 0x02, 0x21, 0xac, 0x12, 0x0c, 0x7c, 0xbc, 0xbd, 0x49, 0xa4,
        0xe4, 0xdd, 0x8a, 0x02, 0x3f, 0x5a, 0x6e, 0xf4, 0xfd, 0x34, 0xfe, 0x52, 0x31, 0x2d, 0x61, 0x42,
        0x2d, 0xee, 0xb3, 0x1a, 0x18, 0x1a, 0x89, 0xd7, 0x42, 0x07, 0xce, 0xe9, 0x95, 0xf2, 0x50, 0x0f,
        0x5a, 0xf8, 0xa0, 0x24, 0xa9, 0xd1, 0x67, 0x06, 0x79, 0x72, 0xba, 0x04, 0x9e, 0x08, 0xe7, 0xa9,
        0xf0, 0x47, 0x59, 0x15, 0xfb, 0x1a, 0x44, 0x5b, 0x4c, 0x8e, 0x4c, 0x33, 0xe4, 0x67, 0x33, 0xd8,
        0xfc, 0xb8, 0xbc, 0x86, 0x2f, 0x09, 0xd3, 0x07, 0x3e, 0xdc, 0x1a, 0xcf, 0x46, 0xd5, 0xbb, 0x39,
        0xde, 0xb9, 0xe2, 0x04, 0xcf, 0xa4, 0xe7, 0x42, 0x31, 0x3a, 0xdd, 0x17, 0x6d, 0xdb, 0x36, 0xf0,
        0x9d, 0xe6, 0xf0, 0x4c, 0x6e, 0x59, 0xc9, 0xb7, 0x96, 0x4b, 0x06, 0xf3, 0xcb, 0xe0, 0x49, 0xdf,
        0x86, 0x47, 0x71, 0x48, 0x4f, 0x01, 0x8f, 0x3d, 0xc8, 0x94, 0x17, 0xb8, 0x4d, 0x08, 0xcc, 0xc6,
        0x45, 0x70, 0x40, 0x5b, 0x3c, 0xd4, 0x5b, 0x58, 0x40, 0x91, 0x2a, 0x08, 0xea, 0xff, 0xfa, 0x93,
        0xf6, 0x79, 0x83, 0x38, 0x55, 0x65, 0x49, 0x10, 0xad, 0xdb, 0x08, 0xaa, 0x3d, 0x2c, 0xe5, 0xbb,
        0x09, 0xfe, 0xbf, 0xeb, 0x2e, 0x40, 0x40, 0x6c, 0x52, 0x34, 0xc6, 0x30, 0x47, 0x76, 0xe6, 0xd2,
        0x97, 0x5d, 0x39, 0x0d, 0x5b, 0x6d, 0x70, 0x21, 0x66, 0xf1, 0x79, 0x2c, 0x94, 0xa1, 0x35, 0xf0,
        0x2e, 0xf1, 0x92, 0xeb, 0x19, 0x70, 0x41, 0x28, 0x0d, 0xa6, 0x4d, 0xaa, 0x5d, 0x8c, 0x1f, 0xf2,
        0x25, 0xe0, 0xed, 0x55, 0x99, 0x02, 0x03, 0x01, 0x00, 0x01, 0xa3, 0x42, 0x30, 0x40, 0x30, 0x1d,
        0x06, 0x03, 0x55, 0x1d, 0x0e, 0x04, 0x16, 0x04, 0x14, 0x20, 0x22, 0xfc, 0xf4, 0x6c, 0xd1, 0x89,
        0x86, 0x38, 0x29, 0x4e, 0x89, 0x2c, 0xc8, 0xaa, 0x4f, 0xf7, 0x1b, 0xfd, 0xa0, 0x30, 0x0f, 0x06,
        0x03, 0x55, 0x1d, 0x13, 0x04, 0x08, 0x30, 0x06, 0x01, 0x01, 0xff, 0x02, 0x01, 0x00, 0x30, 0x0e,
        0x06, 0x03, 0x55, 0x1d, 0x0f, 0x01, 0x01, 0xff, 0x04, 0x04, 0x03, 0x02, 0x01, 0x06, 0x30, 0x0d,
        0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b, 0x05, 0x00, 0x03, 0x82, 0x01,
        0x01, 0x00, 0x8e, 0xf8, 0xee, 0x38, 0xc0, 0xd2, 0x6b, 0xe2, 0x57, 0x14, 0x22, 0xf2, 0x04, 0xab,
        0x32, 0x71, 0x7b, 0x41, 0x55, 0x9b, 0x09, 0xe1, 0x47, 0xb7, 0x2d, 0xb6, 0x84, 0xb0, 0xf6, 0x38,
        0x31, 0x83, 0x7f, 0x84, 0x84, 0x39, 0x64, 0xce, 0x69, 0xec, 0x48, 0xdf, 0x72, 0x73, 0x06, 0xe0,
        0x2b, 0x58, 0x90, 0xdb, 0x1f, 0x34, 0x77, 0x34, 0x02, 0x10, 0x4b, 0x76, 0xae, 0x39, 0xae, 0x74,
        0xfc, 0xee, 0xaf, 0xfa, 0x3b, 0x7b, 0xd4, 0x12, 0xd3, 0x4c, 0x69, 0xf6, 0xe1, 0x53, 0xa9, 0x2d,
        0x85, 0x7e, 0xd8, 0xfb, 0xd5, 0xc5, 0x37, 0xd3, 0x69, 0x99, 0x8c, 0x6b, 0xf9, 0xe9, 0x15, 0x63,
        0x9c, 0x4e, 0xc6, 0x2f, 0x21, 0xf4, 0x90, 0xc8, 0x82, 0x83, 0x0f, 0xe1, 0x50, 0x75, 0xb9, 0x2d,
        0x1a, 0xba, 0x72, 0xf5, 0x20, 0x6a, 0xab, 0x36, 0x8a, 0x0b, 0xf6, 0x69, 0x85, 0x9c, 0xbd, 0xa4,
        0x2d, 0x55, 0x5e, 0x7b, 0xaf, 0xd5, 0x47, 0xa0, 0xb9, 0xf8, 0xa4, 0x93, 0x08, 0xc0, 0x96, 0xa6,
        0x93, 0x2e, 0x24, 0x86, 0x48, 0x23, 0x6b, 0xfd, 0xa3, 0x87, 0x64, 0xa1, 0x9f, 0x18, 0xed, 0x04,
        0x63, 0x42, 0x52, 0xdf, 0x63, 0x37, 0x77, 0xa8, 0x6b, 0x4a, 0x6f, 0x0e, 0xf1, 0x68, 0x5d, 0x54,
        0xb0, 0x6f, 0xf9, 0xc5, 0x46, 0xff, 0x06, 0xdc, 0x1b, 0xd9, 0x7d, 0xa0, 0xe0, 0x89, 0xe9, 0x88,
        0x1f, 0xf2, 0xb7, 0xfd, 0xc2, 0xa5, 0x05, 0xe9, 0x89, 0x65, 0xff, 0x2b, 0x89, 0x81, 0xbd, 0x42,
        0xa2, 0x1a, 0x7d, 0x39, 0x66, 0xca, 0x9e, 0x63, 0x58, 0x31, 0xe2, 0x0d, 0x31, 0x2c, 0x1a, 0x9c,
        0x53, 0xda, 0x6c, 0x9b, 0x23, 0xf3, 0x2b, 0xe5, 0x6c, 0x83, 0x0d, 0xa3, 0x79, 0x14, 0x39, 0x26,
        0x52, 0x83, 0xca, 0xa1, 0x34, 0x85, 0xe6, 0xdf, 0x0b, 0x5b, 0x6f, 0x16, 0xed, 0x02, 0x0a, 0xb2,
        0x45, 0x73
    ]).buffer;

    var feitianFido2 = new Uint8Array([
        0x30, 0x82, 0x02, 0x41, 0x30, 0x82, 0x01, 0xE8, 0xA0, 0x03, 0x02, 0x01, 0x02, 0x02, 0x10, 0x15,
        0x9F, 0x7B, 0xC2, 0xCD, 0x89, 0x18, 0xF1, 0x28, 0x6B, 0x93, 0x48, 0xFA, 0x9F, 0x33, 0xE2, 0x30,
        0x0A, 0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x04, 0x03, 0x02, 0x30, 0x49, 0x31, 0x0B, 0x30,
        0x09, 0x06, 0x03, 0x55, 0x04, 0x06, 0x13, 0x02, 0x43, 0x4E, 0x31, 0x1D, 0x30, 0x1B, 0x06, 0x03,
        0x55, 0x04, 0x0A, 0x0C, 0x14, 0x46, 0x65, 0x69, 0x74, 0x69, 0x61, 0x6E, 0x20, 0x54, 0x65, 0x63,
        0x68, 0x6E, 0x6F, 0x6C, 0x6F, 0x67, 0x69, 0x65, 0x73, 0x31, 0x1B, 0x30, 0x19, 0x06, 0x03, 0x55,
        0x04, 0x03, 0x0C, 0x12, 0x46, 0x65, 0x69, 0x74, 0x69, 0x61, 0x6E, 0x20, 0x46, 0x49, 0x44, 0x4F,
        0x32, 0x20, 0x43, 0x41, 0x2D, 0x31, 0x30, 0x20, 0x17, 0x0D, 0x31, 0x38, 0x30, 0x34, 0x31, 0x31,
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x5A, 0x18, 0x0F, 0x32, 0x30, 0x33, 0x33, 0x30, 0x34, 0x31,
        0x30, 0x32, 0x33, 0x35, 0x39, 0x35, 0x39, 0x5A, 0x30, 0x6F, 0x31, 0x0B, 0x30, 0x09, 0x06, 0x03,
        0x55, 0x04, 0x06, 0x13, 0x02, 0x43, 0x4E, 0x31, 0x1D, 0x30, 0x1B, 0x06, 0x03, 0x55, 0x04, 0x0A,
        0x0C, 0x14, 0x46, 0x65, 0x69, 0x74, 0x69, 0x61, 0x6E, 0x20, 0x54, 0x65, 0x63, 0x68, 0x6E, 0x6F,
        0x6C, 0x6F, 0x67, 0x69, 0x65, 0x73, 0x31, 0x22, 0x30, 0x20, 0x06, 0x03, 0x55, 0x04, 0x0B, 0x0C,
        0x19, 0x41, 0x75, 0x74, 0x68, 0x65, 0x6E, 0x74, 0x69, 0x63, 0x61, 0x74, 0x6F, 0x72, 0x20, 0x41,
        0x74, 0x74, 0x65, 0x73, 0x74, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x31, 0x1D, 0x30, 0x1B, 0x06, 0x03,
        0x55, 0x04, 0x03, 0x0C, 0x14, 0x46, 0x54, 0x20, 0x42, 0x69, 0x6F, 0x50, 0x61, 0x73, 0x73, 0x20,
        0x46, 0x49, 0x44, 0x4F, 0x32, 0x20, 0x55, 0x53, 0x42, 0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2A,
        0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01, 0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x03, 0x01, 0x07,
        0x03, 0x42, 0x00, 0x04, 0x80, 0x06, 0x75, 0x5C, 0x59, 0xFB, 0xC9, 0x49, 0xB0, 0x15, 0xA8, 0xD2,
        0x0A, 0x92, 0x58, 0x97, 0xBE, 0x83, 0x0A, 0xB2, 0xEF, 0xE8, 0x2C, 0xF8, 0x8F, 0xED, 0xA0, 0x90,
        0x96, 0x63, 0xE5, 0x48, 0xC7, 0x1F, 0x11, 0x27, 0x05, 0x33, 0xB4, 0x24, 0x46, 0x78, 0x9D, 0x4C,
        0xFE, 0xE1, 0x01, 0x43, 0x8A, 0x94, 0xE9, 0x83, 0x3D, 0xE2, 0x00, 0x2C, 0x2F, 0x2A, 0x1D, 0xD7,
        0x6F, 0x4D, 0xDB, 0x5D, 0xA3, 0x81, 0x89, 0x30, 0x81, 0x86, 0x30, 0x1D, 0x06, 0x03, 0x55, 0x1D,
        0x0E, 0x04, 0x16, 0x04, 0x14, 0x7A, 0x54, 0x82, 0x42, 0x80, 0x62, 0xD8, 0x8A, 0xE7, 0xAF, 0x84,
        0x98, 0x25, 0xC4, 0xAF, 0x91, 0xA9, 0x34, 0x98, 0xF2, 0x30, 0x1F, 0x06, 0x03, 0x55, 0x1D, 0x23,
        0x04, 0x18, 0x30, 0x16, 0x80, 0x14, 0x4D, 0x3B, 0xD8, 0xC4, 0x67, 0x15, 0x1B, 0xBB, 0x13, 0xE8,
        0xF3, 0x84, 0xD8, 0x30, 0x4F, 0x9D, 0x69, 0x15, 0xC0, 0x83, 0x30, 0x0C, 0x06, 0x03, 0x55, 0x1D,
        0x13, 0x01, 0x01, 0xFF, 0x04, 0x02, 0x30, 0x00, 0x30, 0x13, 0x06, 0x0B, 0x2B, 0x06, 0x01, 0x04,
        0x01, 0x82, 0xE5, 0x1C, 0x02, 0x01, 0x01, 0x04, 0x04, 0x03, 0x02, 0x05, 0x20, 0x30, 0x21, 0x06,
        0x0B, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x82, 0xE5, 0x1C, 0x01, 0x01, 0x04, 0x04, 0x12, 0x04, 0x10,
        0x42, 0x38, 0x32, 0x45, 0x44, 0x37, 0x33, 0x43, 0x38, 0x46, 0x42, 0x34, 0x45, 0x35, 0x41, 0x32,
        0x30, 0x0A, 0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x04, 0x03, 0x02, 0x03, 0x47, 0x00, 0x30,
        0x44, 0x02, 0x20, 0x24, 0x4B, 0x45, 0xA3, 0xBE, 0x88, 0xDC, 0xB7, 0xE0, 0x25, 0xA2, 0xC6, 0xA3,
        0x12, 0xCF, 0xFB, 0x86, 0xED, 0xBC, 0x27, 0x4A, 0x22, 0xC1, 0x05, 0x2E, 0x31, 0x48, 0x51, 0xF0,
        0xE8, 0xB0, 0x87, 0x02, 0x20, 0x34, 0x1A, 0xBF, 0x4E, 0x1C, 0x24, 0xF2, 0x0B, 0x1A, 0x73, 0xD5,
        0x3D, 0xAC, 0xC2, 0xA9, 0xF9, 0x15, 0xB4, 0x1B, 0xB2, 0x3A, 0x6B, 0x01, 0x6F, 0x1F, 0xEF, 0xF8,
        0xE0, 0xE7, 0xF8, 0x90, 0xC0,
    ]).buffer;

    var tpmAttestation = new Uint8Array([
        0x30, 0x82, 0x04, 0xB2, 0x30, 0x82, 0x03, 0x9A, 0xA0, 0x03, 0x02, 0x01, 0x02, 0x02, 0x10, 0x13,
        0x28, 0x9D, 0xA5, 0x66, 0x73, 0x47, 0x13, 0x92, 0x30, 0xD7, 0xEB, 0x02, 0xF5, 0x75, 0x7F, 0x30,
        0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x0B, 0x05, 0x00, 0x30, 0x41,
        0x31, 0x3F, 0x30, 0x3D, 0x06, 0x03, 0x55, 0x04, 0x03, 0x13, 0x36, 0x4E, 0x43, 0x55, 0x2D, 0x4E,
        0x54, 0x43, 0x2D, 0x4B, 0x45, 0x59, 0x49, 0x44, 0x2D, 0x31, 0x35, 0x39, 0x31, 0x44, 0x34, 0x42,
        0x36, 0x45, 0x41, 0x46, 0x39, 0x38, 0x44, 0x30, 0x31, 0x30, 0x34, 0x38, 0x36, 0x34, 0x42, 0x36,
        0x39, 0x30, 0x33, 0x41, 0x34, 0x38, 0x44, 0x44, 0x30, 0x30, 0x32, 0x36, 0x30, 0x37, 0x37, 0x44,
        0x33, 0x30, 0x1E, 0x17, 0x0D, 0x31, 0x38, 0x30, 0x35, 0x32, 0x30, 0x31, 0x36, 0x32, 0x30, 0x34,
        0x34, 0x5A, 0x17, 0x0D, 0x32, 0x38, 0x30, 0x35, 0x32, 0x30, 0x31, 0x36, 0x32, 0x30, 0x34, 0x34,
        0x5A, 0x30, 0x00, 0x30, 0x82, 0x01, 0x22, 0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7,
        0x0D, 0x01, 0x01, 0x01, 0x05, 0x00, 0x03, 0x82, 0x01, 0x0F, 0x00, 0x30, 0x82, 0x01, 0x0A, 0x02,
        0x82, 0x01, 0x01, 0x00, 0xBD, 0x0E, 0x97, 0x2B, 0x6B, 0xA3, 0x33, 0x5D, 0x44, 0xEF, 0x1E, 0x12,
        0x2F, 0x7E, 0x29, 0xDB, 0x9D, 0xA7, 0x73, 0x24, 0x13, 0x77, 0x7F, 0xB8, 0xAF, 0x90, 0x0B, 0x42,
        0x10, 0x5B, 0x14, 0xA4, 0xBD, 0xE6, 0x05, 0x2C, 0xB8, 0x43, 0x53, 0x1B, 0xEE, 0x3C, 0x18, 0x14,
        0x30, 0xBB, 0x8F, 0x22, 0xD3, 0xA7, 0x1C, 0x92, 0x6D, 0xDE, 0x1F, 0x6D, 0x13, 0x51, 0xE2, 0x6F,
        0x9F, 0x8F, 0xA9, 0x8F, 0xA8, 0xBC, 0x2C, 0x53, 0xAB, 0x20, 0xAD, 0x78, 0x4F, 0x73, 0xF7, 0x18,
        0x5C, 0xDB, 0xC6, 0x04, 0x0B, 0xAB, 0x52, 0x95, 0x9B, 0xAD, 0xC9, 0x58, 0x37, 0x44, 0x5E, 0x4E,
        0xFC, 0xF4, 0x98, 0x33, 0x42, 0x31, 0xCD, 0x3B, 0xB0, 0xD9, 0x14, 0xA5, 0x93, 0x12, 0x29, 0x2D,
        0xC2, 0x60, 0x54, 0x3D, 0x40, 0x3C, 0xF1, 0x38, 0xD0, 0x71, 0x73, 0xAD, 0xAD, 0x1E, 0x44, 0x5D,
        0x3A, 0xED, 0xD4, 0x5C, 0xC6, 0xCD, 0xA6, 0xCE, 0x7A, 0x91, 0x5A, 0x9E, 0x7D, 0xCD, 0xCB, 0xF5,
        0xED, 0xC4, 0x8F, 0x25, 0x0D, 0x9D, 0xD0, 0x2F, 0x03, 0xCB, 0x25, 0xF9, 0xA4, 0xEE, 0x9B, 0x86,
        0xB6, 0x41, 0x8D, 0x69, 0x73, 0xAC, 0x44, 0x2E, 0xC6, 0x2C, 0x09, 0xE8, 0x10, 0x1E, 0xD4, 0x5A,
        0xF8, 0xE2, 0xC8, 0xA1, 0xBA, 0x1C, 0x0B, 0x6F, 0x55, 0x38, 0x31, 0x71, 0x6E, 0x4E, 0x42, 0x71,
        0xC5, 0x6F, 0xD0, 0x07, 0xC9, 0xC5, 0x39, 0x41, 0xDB, 0xA4, 0x5E, 0xB3, 0xF4, 0x9E, 0x37, 0x42,
        0xA4, 0xB0, 0x91, 0x47, 0x43, 0x6A, 0xE9, 0x53, 0x0A, 0x99, 0x55, 0x37, 0x31, 0xA1, 0xA1, 0xF8,
        0x30, 0xB0, 0x60, 0x40, 0x77, 0xDA, 0xC3, 0xCD, 0x3D, 0xD0, 0xE4, 0x3C, 0x35, 0xB2, 0x93, 0x5E,
        0x88, 0xB7, 0x07, 0x26, 0x5E, 0xA7, 0xD2, 0x05, 0x5E, 0x59, 0x3A, 0xBF, 0x22, 0x7E, 0xF7, 0x17,
        0x6C, 0x25, 0x94, 0x5B, 0x02, 0x03, 0x01, 0x00, 0x01, 0xA3, 0x82, 0x01, 0xE5, 0x30, 0x82, 0x01,
        0xE1, 0x30, 0x0E, 0x06, 0x03, 0x55, 0x1D, 0x0F, 0x01, 0x01, 0xFF, 0x04, 0x04, 0x03, 0x02, 0x07,
        0x80, 0x30, 0x0C, 0x06, 0x03, 0x55, 0x1D, 0x13, 0x01, 0x01, 0xFF, 0x04, 0x02, 0x30, 0x00, 0x30,
        0x6D, 0x06, 0x03, 0x55, 0x1D, 0x20, 0x01, 0x01, 0xFF, 0x04, 0x63, 0x30, 0x61, 0x30, 0x5F, 0x06,
        0x09, 0x2B, 0x06, 0x01, 0x04, 0x01, 0x82, 0x37, 0x15, 0x1F, 0x30, 0x52, 0x30, 0x50, 0x06, 0x08,
        0x2B, 0x06, 0x01, 0x05, 0x05, 0x07, 0x02, 0x02, 0x30, 0x44, 0x1E, 0x42, 0x00, 0x54, 0x00, 0x43,
        0x00, 0x50, 0x00, 0x41, 0x00, 0x20, 0x00, 0x20, 0x00, 0x54, 0x00, 0x72, 0x00, 0x75, 0x00, 0x73,
        0x00, 0x74, 0x00, 0x65, 0x00, 0x64, 0x00, 0x20, 0x00, 0x20, 0x00, 0x50, 0x00, 0x6C, 0x00, 0x61,
        0x00, 0x74, 0x00, 0x66, 0x00, 0x6F, 0x00, 0x72, 0x00, 0x6D, 0x00, 0x20, 0x00, 0x20, 0x00, 0x49,
        0x00, 0x64, 0x00, 0x65, 0x00, 0x6E, 0x00, 0x74, 0x00, 0x69, 0x00, 0x74, 0x00, 0x79, 0x30, 0x10,
        0x06, 0x03, 0x55, 0x1D, 0x25, 0x04, 0x09, 0x30, 0x07, 0x06, 0x05, 0x67, 0x81, 0x05, 0x08, 0x03,
        0x30, 0x4A, 0x06, 0x03, 0x55, 0x1D, 0x11, 0x01, 0x01, 0xFF, 0x04, 0x40, 0x30, 0x3E, 0xA4, 0x3C,
        0x30, 0x3A, 0x31, 0x38, 0x30, 0x0E, 0x06, 0x05, 0x67, 0x81, 0x05, 0x02, 0x03, 0x0C, 0x05, 0x69,
        0x64, 0x3A, 0x31, 0x33, 0x30, 0x10, 0x06, 0x05, 0x67, 0x81, 0x05, 0x02, 0x02, 0x0C, 0x07, 0x4E,
        0x50, 0x43, 0x54, 0x36, 0x78, 0x78, 0x30, 0x14, 0x06, 0x05, 0x67, 0x81, 0x05, 0x02, 0x01, 0x0C,
        0x0B, 0x69, 0x64, 0x3A, 0x34, 0x45, 0x35, 0x34, 0x34, 0x33, 0x30, 0x30, 0x30, 0x1F, 0x06, 0x03,
        0x55, 0x1D, 0x23, 0x04, 0x18, 0x30, 0x16, 0x80, 0x14, 0xC2, 0x12, 0xA9, 0x5B, 0xCE, 0xFA, 0x56,
        0xF8, 0xC0, 0xC1, 0x6F, 0xB1, 0x5B, 0xDD, 0x03, 0x34, 0x47, 0xB3, 0x7A, 0xA3, 0x30, 0x1D, 0x06,
        0x03, 0x55, 0x1D, 0x0E, 0x04, 0x16, 0x04, 0x14, 0xAF, 0xE2, 0x45, 0xD3, 0x48, 0x0F, 0x22, 0xDC,
        0xD5, 0x0C, 0xD2, 0xAE, 0x7B, 0x96, 0xB5, 0xA9, 0x33, 0xCA, 0x7F, 0xE1, 0x30, 0x81, 0xB3, 0x06,
        0x08, 0x2B, 0x06, 0x01, 0x05, 0x05, 0x07, 0x01, 0x01, 0x04, 0x81, 0xA6, 0x30, 0x81, 0xA3, 0x30,
        0x81, 0xA0, 0x06, 0x08, 0x2B, 0x06, 0x01, 0x05, 0x05, 0x07, 0x30, 0x02, 0x86, 0x81, 0x93, 0x68,
        0x74, 0x74, 0x70, 0x73, 0x3A, 0x2F, 0x2F, 0x61, 0x7A, 0x63, 0x73, 0x70, 0x72, 0x6F, 0x64, 0x6E,
        0x63, 0x75, 0x61, 0x69, 0x6B, 0x70, 0x75, 0x62, 0x6C, 0x69, 0x73, 0x68, 0x2E, 0x62, 0x6C, 0x6F,
        0x62, 0x2E, 0x63, 0x6F, 0x72, 0x65, 0x2E, 0x77, 0x69, 0x6E, 0x64, 0x6F, 0x77, 0x73, 0x2E, 0x6E,
        0x65, 0x74, 0x2F, 0x6E, 0x63, 0x75, 0x2D, 0x6E, 0x74, 0x63, 0x2D, 0x6B, 0x65, 0x79, 0x69, 0x64,
        0x2D, 0x31, 0x35, 0x39, 0x31, 0x64, 0x34, 0x62, 0x36, 0x65, 0x61, 0x66, 0x39, 0x38, 0x64, 0x30,
        0x31, 0x30, 0x34, 0x38, 0x36, 0x34, 0x62, 0x36, 0x39, 0x30, 0x33, 0x61, 0x34, 0x38, 0x64, 0x64,
        0x30, 0x30, 0x32, 0x36, 0x30, 0x37, 0x37, 0x64, 0x33, 0x2F, 0x33, 0x62, 0x39, 0x31, 0x38, 0x61,
        0x65, 0x34, 0x2D, 0x30, 0x37, 0x65, 0x31, 0x2D, 0x34, 0x30, 0x35, 0x39, 0x2D, 0x39, 0x34, 0x39,
        0x31, 0x2D, 0x30, 0x61, 0x64, 0x32, 0x34, 0x38, 0x31, 0x39, 0x30, 0x38, 0x31, 0x38, 0x2E, 0x63,
        0x65, 0x72, 0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x0B, 0x05,
        0x00, 0x03, 0x82, 0x01, 0x01, 0x00, 0x2C, 0xFA, 0xFA, 0x9D, 0x90, 0x35, 0xF4, 0xF5, 0xF3, 0x4D,
        0x62, 0xAC, 0xDB, 0xBF, 0x72, 0xE1, 0xD2, 0xF9, 0x7A, 0x46, 0x01, 0xA9, 0x3C, 0x69, 0x7E, 0x31,
        0x88, 0x0E, 0xF0, 0xB8, 0x35, 0x23, 0xD5, 0x0A, 0xBC, 0x45, 0x1A, 0x69, 0x41, 0xE6, 0xF3, 0x8E,
        0x40, 0x05, 0x2F, 0x26, 0xEE, 0xBF, 0x69, 0xDB, 0x64, 0x42, 0x58, 0xEE, 0x93, 0x48, 0x43, 0xD2,
        0xD1, 0x85, 0x18, 0xCC, 0x0B, 0x0D, 0xBA, 0x22, 0xA2, 0x19, 0x59, 0xDA, 0xE2, 0x70, 0x7D, 0x25,
        0x66, 0x5A, 0x57, 0xD1, 0x83, 0x4B, 0xA6, 0x8C, 0x0F, 0x49, 0xC9, 0xF2, 0x43, 0x5C, 0x8A, 0x8A,
        0xC3, 0xB1, 0x5E, 0xB4, 0x8F, 0x46, 0x1B, 0xE7, 0xDD, 0xA4, 0xBF, 0x55, 0x64, 0x38, 0xA9, 0x5B,
        0x4C, 0x5E, 0xFE, 0x67, 0x5D, 0x23, 0x69, 0xAA, 0x71, 0xD0, 0x2A, 0xA1, 0xC4, 0x42, 0x14, 0xCC,
        0x40, 0x5B, 0xF3, 0x2F, 0x4F, 0x6B, 0xCA, 0x0E, 0x69, 0x07, 0xFC, 0x39, 0x18, 0x43, 0x1D, 0x9A,
        0x7E, 0x99, 0xB9, 0xFF, 0x5B, 0xCA, 0xD4, 0xCD, 0x74, 0x83, 0x4B, 0x4A, 0xC5, 0x6D, 0x62, 0x9A,
        0x5B, 0x8B, 0x46, 0xA5, 0x5A, 0x0A, 0x19, 0x11, 0xFE, 0x7F, 0xDB, 0xC8, 0x79, 0x7C, 0x46, 0x97,
        0x15, 0x52, 0xD3, 0x0A, 0xAA, 0x46, 0x6F, 0xEB, 0xFA, 0x1D, 0x5A, 0x64, 0x89, 0xED, 0x6B, 0x43,
        0x8E, 0x88, 0xBF, 0xD2, 0xE3, 0x7E, 0xBB, 0x81, 0x9C, 0x9E, 0x2C, 0xBD, 0xDE, 0x52, 0x7C, 0xDD,
        0x77, 0xE7, 0x98, 0xC9, 0x26, 0x27, 0xD9, 0x72, 0x0D, 0x3D, 0xB5, 0x5A, 0x70, 0xAF, 0x19, 0x89,
        0xF7, 0x6C, 0x2C, 0xCC, 0x22, 0x36, 0xDC, 0xF9, 0xB8, 0xCD, 0x63, 0x6E, 0xAA, 0x44, 0x9F, 0x65,
        0x28, 0x07, 0x71, 0xDC, 0x76, 0x7D, 0x21, 0x73, 0x5D, 0xA3, 0x4C, 0xB3, 0xD6, 0x15, 0xF8, 0x3B,
        0x1A, 0x22, 0x90, 0xD2, 0x19, 0x3D
    ]).buffer;

    var certs = {
        yubiKeyAttestation,
        yubicoRoot,
        feitianFido2,
        tpmAttestation
    };

    /********************************************************************************
     *********************************************************************************
     * MDS
     *********************************************************************************
     *********************************************************************************/

    // downloaded Jun 6, 2018
    var mds1TocJwt = "eyJhbGciOiAiRVMyNTYiLCAidHlwIjogIkpXVCIsICJ4NWMiOiBbIk1J" +
    "SUNuVENDQWtPZ0F3SUJBZ0lPUnZDTTFhdVU2RllWWFVlYkpIY3dDZ1lJS29aSXpqMEVBd0l3VX" +
    "pFTE1Ba0dBMVVFQmhNQ1ZWTXhGakFVQmdOVkJBb1REVVpKUkU4Z1FXeHNhV0Z1WTJVeEhUQWJC" +
    "Z05WQkFzVEZFMWxkR0ZrWVhSaElGUlBReUJUYVdkdWFXNW5NUTB3Q3dZRFZRUURFd1JEUVMweE" +
    "1CNFhEVEUxTURneE9UQXdNREF3TUZvWERURTRNRGd4T1RBd01EQXdNRm93WkRFTE1Ba0dBMVVF" +
    "QmhNQ1ZWTXhGakFVQmdOVkJBb1REVVpKUkU4Z1FXeHNhV0Z1WTJVeEhUQWJCZ05WQkFzVEZFMW" +
    "xkR0ZrWVhSaElGUlBReUJUYVdkdWFXNW5NUjR3SEFZRFZRUURFeFZOWlhSaFpHRjBZU0JVVDBN" +
    "Z1UybG5ibVZ5SURNd1dUQVRCZ2NxaGtqT1BRSUJCZ2dxaGtqT1BRTUJCd05DQUFTS1grcDNXMm" +
    "oxR1Y0bFF3bjdIWE5qNGxoOWUyd0FhNko5dEJJUWhiUVRrcU12TlpHbkh4T243eVRaM05wWU81" +
    "WkdWZ3IvWEM2NnFsaTdCV0E4amdUZm80SHBNSUhtTUE0R0ExVWREd0VCL3dRRUF3SUd3REFNQm" +
    "dOVkhSTUJBZjhFQWpBQU1CMEdBMVVkRGdRV0JCUmNrTkYrenp4TXVMdm0rcVJqTGVKUWYwRHd5" +
    "ekFmQmdOVkhTTUVHREFXZ0JScEVWNHRhV1NGblphNDF2OWN6Yjg4ZGM5TUdEQTFCZ05WSFI4RU" +
    "xqQXNNQ3FnS0tBbWhpUm9kSFJ3T2k4dmJXUnpMbVpwWkc5aGJHeHBZVzVqWlM1dmNtY3ZRMEV0" +
    "TVM1amNtd3dUd1lEVlIwZ0JFZ3dSakJFQmdzckJnRUVBWUxsSEFFREFUQTFNRE1HQ0NzR0FRVU" +
    "ZCd0lCRmlkb2RIUndjem92TDIxa2N5NW1hV1J2WVd4c2FXRnVZMlV1YjNKbkwzSmxjRzl6YVhS" +
    "dmNua3dDZ1lJS29aSXpqMEVBd0lEU0FBd1JRSWhBTExiWWpCcmJoUGt3cm4zbVFqQ0VSSXdrTU" +
    "5OVC9sZmtwTlhIKzR6alVYRUFpQmFzMmxQNmpwNDRCaDRYK3RCWHFZN3k2MWlqR1JJWkNhQUYx" +
    "S0lsZ3ViMGc9PSIsICJNSUlDc2pDQ0FqaWdBd0lCQWdJT1JxbXhrOE5RdUpmQ0VOVllhMVF3Q2" +
    "dZSUtvWkl6ajBFQXdNd1V6RUxNQWtHQTFVRUJoTUNWVk14RmpBVUJnTlZCQW9URFVaSlJFOGdR" +
    "V3hzYVdGdVkyVXhIVEFiQmdOVkJBc1RGRTFsZEdGa1lYUmhJRlJQUXlCVGFXZHVhVzVuTVEwd0" +
    "N3WURWUVFERXdSU2IyOTBNQjRYRFRFMU1EWXhOekF3TURBd01Gb1hEVFF3TURZeE56QXdNREF3" +
    "TUZvd1V6RUxNQWtHQTFVRUJoTUNWVk14RmpBVUJnTlZCQW9URFVaSlJFOGdRV3hzYVdGdVkyVX" +
    "hIVEFiQmdOVkJBc1RGRTFsZEdGa1lYUmhJRlJQUXlCVGFXZHVhVzVuTVEwd0N3WURWUVFERXdS" +
    "RFFTMHhNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUU5c0RnQzhQekJZbC93S3" +
    "FwWGZhOThqT0lvNzhsOXB6NHhPekdER0l6MHpFWE1Yc0JZNmtBaHlVNEdSbVQwd280dHlVdng1" +
    "Qlk4T0tsc0xNemxiS01SYU9CN3pDQjdEQU9CZ05WSFE4QkFmOEVCQU1DQVFZd0VnWURWUjBUQV" +
    "FIL0JBZ3dCZ0VCL3dJQkFEQWRCZ05WSFE0RUZnUVVhUkZlTFdsa2haMld1TmIvWE0yL1BIWFBU" +
    "Qmd3SHdZRFZSMGpCQmd3Rm9BVTBxVWZDNmYyWXNoQTFOaTl1ZGVPMFZTN3ZFWXdOUVlEVlIwZk" +
    "JDNHdMREFxb0NpZ0pvWWthSFIwY0RvdkwyMWtjeTVtYVdSdllXeHNhV0Z1WTJVdWIzSm5MMUp2" +
    "YjNRdVkzSnNNRThHQTFVZElBUklNRVl3UkFZTEt3WUJCQUdDNVJ3QkF3RXdOVEF6QmdnckJnRU" +
    "ZCUWNDQVJZbmFIUjBjSE02THk5dFpITXVabWxrYjJGc2JHbGhibU5sTG05eVp5OXlaWEJ2YzJs" +
    "MGIzSjVNQW9HQ0NxR1NNNDlCQU1EQTJnQU1HVUNNQkxWcTBKZFd2MnlZNFJwMUlpeUlWV0VLRz" +
    "FQVHoxcFBBRnFFbmFrUHR3NFJNUlRHd0hkYjJpZmNEYlBvRWtmWVFJeEFPTGtmRVBqMjJmQm5l" +
    "ajF3dGd5eWxzdTczcktMVXY0eGhEeTlUQWVWVW1sMGlEQk04U3RFNERpVnMvNGVqRmhxUT09Il" +
    "19.eyJuZXh0VXBkYXRlIjogIjIwMTgtMDYtMTgiLCAibm8iOiA2MiwgImVudHJpZXMiOiBbeyJ" +
    "1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDEzJTIzMDAwM" +
    "SIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTUtMDUtMjAiLCAiaGFzaCI6ICIwNkx" +
    "aeEo1bU51TlpqNDhJWkxWODE2YmZwM0E3R1Z0TzJPLUVlUTFwa1RZPSIsICJhYWlkIjogIjAwM" +
    "TMjMDAwMSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiw" +
    "gInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0wN" +
    "S0yMCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGE" +
    "vMDAxMyUyMzAwNjEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE1LTEyLTIyIiwgI" +
    "mhhc2giOiAiZ1c4OVQxZzkyUmZXVG4yalhhUG8tc05TaW1nNHlwamdob2cwR25NRFA1Yz0iLCA" +
    "iYWFpZCI6ICIwMDEzIzAwNjEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX" +
    "0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXR" +
    "lIjogIjIwMTUtMTItMjIifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub" +
    "3JnL21ldGFkYXRhLzAwMTMlMjMwMDcxIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjA" +
    "xNS0xMi0yMiIsICJoYXNoIjogIm5hREJvTndkNEExeGJLZ3FtSVBJbzM0RGNyb05PaWJqMkwtU" +
    "UF0bE40TU09IiwgImFhaWQiOiAiMDAxMyMwMDcxIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF" +
    "0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZ" +
    "WZmZWN0aXZlRGF0ZSI6ICIyMDE1LTEyLTIyIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZml" +
    "kb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDEzJTIzMDA4NCIsICJ0aW1lT2ZMYXN0U3RhdHVzQ" +
    "2hhbmdlIjogIjIwMTUtMTItMjIiLCAiaGFzaCI6ICJjNy1nT3gxTkFhTF9rcXVXRWl3V3VWWDQ" +
    "taGhrZDNNZTY0REp3eFhQRXBvPSIsICJhYWlkIjogIjAwMTMjMDA4NCIsICJzdGF0dXNSZXBvc" +
    "nRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWN" +
    "hdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0xMi0yMiJ9XX0sIHsidXJsIjogImh0d" +
    "HBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxNCUyM0ZGRjEiLCAidGltZU9" +
    "mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTExLTIyIiwgImhhc2giOiAiVlV0SWtQWHloa21GR" +
    "mMxR2pUcmdGWDBnWnFkX1d4UHZzaTJnY3M5VF8zST0iLCAiYWFpZCI6ICIwMDE0I0ZGRjEiLCA" +
    "ic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsI" +
    "jogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE1LTA5LTI1In0" +
    "sIHsic3RhdHVzIjogIlJFVk9LRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZ" +
    "WZmZWN0aXZlRGF0ZSI6ICIyMDE2LTExLTIyIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZml" +
    "kb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDE0JTIzRkZGMiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ" +
    "2hhbmdlIjogIjIwMTYtMTEtMjIiLCAiaGFzaCI6ICJ1SDJoRTFUOHVJQmhuRjdGcm4zcUs4S0I" +
    "4SktJLVpKYnBzUlBteWNIZmZzPSIsICJhYWlkIjogIjAwMTQjRkZGMiIsICJzdGF0dXNSZXBvc" +
    "nRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnR" +
    "pZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTUtMDktMzAifSwgeyJzdGF0dXMiO" +
    "iAiUkVWT0tFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXR" +
    "lIjogIjIwMTYtMTEtMjIifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub" +
    "3JnL21ldGFkYXRhLzAwMTQlMjNGRkYzIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjA" +
    "xNi0xMS0yMiIsICJoYXNoIjogIm1hUXloSW9kSWlqa1lpMkh5c3YtaGhWcC1qUzJILU5rWjBuZ" +
    "lplRElvUHM9IiwgImFhaWQiOiAiMDAxNCNGRkYzIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF" +
    "0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiI" +
    "iwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0xMC0zMSJ9LCB7InN0YXR1cyI6ICJSRVZPS0VEIiw" +
    "gInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0xM" +
    "S0yMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGE" +
    "vMDAxNSUyMzAwMDIiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAxLTA4IiwgI" +
    "mhhc2giOiAiaThfd2N3MWFXRFJpRlVRZWtfbGIwNjhFdUxVY1NoTGpyeGNKVzBCOE92WT0iLCA" +
    "iYWFpZCI6ICIwMDE1IzAwMDIiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX" +
    "0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXR" +
    "lIjogIjIwMTYtMDEtMDgifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub" +
    "3JnL21ldGFkYXRhLzAwMTUlMjMwMDA1IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjA" +
    "xNy0wMi0wOCIsICJoYXNoIjogIlExZHFVck1wU3RwQkEyanJ0clJ6Rkt5amxWc2RpSWdyTU9te" +
    "DV0dV9iWnc9IiwgImFhaWQiOiAiMDAxNSMwMDA1IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF" +
    "0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZ" +
    "WZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAyLTA4In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZml" +
    "kb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDE2JTIzMDAwMSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ" +
    "2hhbmdlIjogIjIwMTUtMDctMjEiLCAiaGFzaCI6ICJ1eWpESnBOSm9LTjlDMmhxOEktd2dVeGt" +
    "kdXdBV1hRUUM5dXFrVHVHek5rPSIsICJhYWlkIjogIjAwMTYjMDAwMSIsICJzdGF0dXNSZXBvc" +
    "nRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWN" +
    "hdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNS0wNy0yMSJ9XX0sIHsidXJsIjogImh0d" +
    "HBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxNiUyMzAwMDMiLCAidGltZU9" +
    "mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAyLTEwIiwgImhhc2giOiAidFRlaGVMRDNHS0dqe" +
    "GZidlYyZG9PX25VbGd5NHF5Y0o0MnhHQlpUTnZ4WT0iLCAiYWFpZCI6ICIwMDE2IzAwMDMiLCA" +
    "ic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsI" +
    "jogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAyLTEwIn1" +
    "dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDE2J" +
    "TIzMDAxMCIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMDItMTAiLCAiaGFzaCI" +
    "6ICJSeWs0enpHSEV0M0hhOG5PQ1J3Wlo0VTh6VFdKeXhxTnFCNHpTcGRHR3k0PSIsICJhYWlkI" +
    "jogIjAwMTYjMDAxMCIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0N" +
    "FUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlI" +
    "jogIjIwMTYtMDItMTAifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3J" +
    "nL21ldGFkYXRhLzAwMTYlMjMwMDIwIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxN" +
    "i0wMi0xMCIsICJoYXNoIjogInBYQVktQ05EV0tiVC1mVS1HclFGQWRyeERDbnM3R1U1Q3JaLVF" +
    "Ebm5TZEE9IiwgImFhaWQiOiAiMDAxNiMwMDIwIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0d" +
    "XMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiw" +
    "gImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMi0xMCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzL" +
    "mZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxNyUyMzA0MDAiLCAidGltZU9mTGFzdFN0YXR" +
    "1c0NoYW5nZSI6ICIyMDE1LTEyLTI3IiwgImhhc2giOiAiOUg1N2ZHTGEyZjFhQ01wSC1xc1l0V" +
    "01UX2lVVUh0YzhkOFNZb25BblRvOD0iLCAiYWFpZCI6ICIwMDE3IzA0MDAiLCAic3RhdHVzUmV" +
    "wb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZ" +
    "mljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTUtMTItMjcifV19LCB7InVybCI6ICJ" +
    "odHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMTklMjMwMDA1IiwgInRpb" +
    "WVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNS0wNy0yMiIsICJoYXNoIjogImxmSmtOYUFHQWV" +
    "iWnpvTnpfMElaUXd4VlVnUHVYU1VJMnBiM0JsTmxZdms9IiwgImFhaWQiOiAiMDAxOSMwMDA1I" +
    "iwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjo" +
    "gIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE1LTA3LTIyIn1df" +
    "SwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDE5JTI" +
    "zMTAwNSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDItMTAiLCAiaGFzaCI6I" +
    "CJfWnRiaE5zc2tYdWQ2bXJhMjh5T1R5akxEelFVdkdsOUluLUZaYjJYaTQ0PSIsICJhYWlkIjo" +
    "gIjAwMTkjMTAwNSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGS" +
    "UVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjA" +
    "xNy0wMi0xMCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0Y" +
    "WRhdGEvMDAxOSUyMzEwMDkiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTAyLTE" +
    "wIiwgImhhc2giOiAiS0J0bnZ1M0pjY1l0Q0NJZmR1VzFIV3p1TFZlclo5UlJCWWdyTWFCakIyN" +
    "D0iLCAiYWFpZCI6ICIwMDE5IzEwMDkiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJ" +
    "GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3Rpd" +
    "mVEYXRlIjogIjIwMTctMDItMTAifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWF" +
    "uY2Uub3JnL21ldGFkYXRhLzAwMUIlMjMwMDAxIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiO" +
    "iAiMjAxNi0wMS0wMSIsICJoYXNoIjogInBRVjJiUjktSU1EYUdGWkpDNkJLYXRmOTN0SVBUZlN" +
    "2a2xUdkdMam44REE9IiwgImFhaWQiOiAiMDAxQiMwMDAxIiwgInN0YXR1c1JlcG9ydHMiOiBbe" +
    "yJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGU" +
    "iOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMS0wMSJ9XX0sIHsidXJsIjogImh0dHBzO" +
    "i8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxRCUyMzAwMDEiLCAidGltZU9mTGF" +
    "zdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTAzLTMxIiwgImhhc2giOiAiWEhjMzJVWGVmdnNQT1p6L" +
    "UNOYU5fZFNYUFBYaW5EQ2JRekpqRTZaWWpSdz0iLCAiYWFpZCI6ICIwMDFEIzAwMDEiLCAic3R" +
    "hdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogI" +
    "iIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAzLTMxIn1dfSw" +
    "geyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDFEJTIzM" +
    "DAwMiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDUtMDQiLCAiaGFzaCI6ICJ" +
    "hc2NVWGxwdzdDMHJjdFFGaENSNUViS25jLXNWTkxPUFlxd1AxM045Nmk4PSIsICJhYWlkIjogI" +
    "jAwMUQjMDAwMiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlR" +
    "JRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogI" +
    "jIwMTctMDUtMDQifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21" +
    "ldGFkYXRhLzAwMUQlMjMxMDAxIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wM" +
    "y0yOCIsICJoYXNoIjogImJyWWI2azdacktkYzdBeDFRVEM4ZHd6Q3c5clYxSngxWkl4a3drREJ" +
    "PUTg9IiwgImFhaWQiOiAiMDAxRCMxMDAxIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiO" +
    "iAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImV" +
    "mZmVjdGl2ZURhdGUiOiAiMjAxNy0wMy0yOCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZ" +
    "G9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAxRSUyMzAwMDEiLCAidGltZU9mTGFzdFN0YXR1c0N" +
    "oYW5nZSI6ICIyMDE2LTAzLTMxIiwgImhhc2giOiAiNnlycnJnTmRiaXZaN0ktRjRCUnBEeFZZN" +
    "1hzRHE5WEJWdExydjFQd2dxUT0iLCAiYWFpZCI6ICIwMDFFIzAwMDEiLCAic3RhdHVzUmVwb3J" +
    "0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0a" +
    "WZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAzLTMxIn1dfSwgeyJ1cmwiOiA" +
    "iaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDFFJTIzMDAwMiIsICJ0a" +
    "W1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMDEtMTgiLCAiaGFzaCI6ICI2djdJQzNrMk1" +
    "uUXNyNFhjWFh3V19zTnBRaS1VWm5LNWxrdWVIdXlKcGRFPSIsICJhYWlkIjogIjAwMUUjMDAwM" +
    "iIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ" +
    "1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDEtM" +
    "TgifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzA" +
    "wMUUlMjMwMDAzIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMi0wNCIsICJoY" +
    "XNoIjogIjZIZVNjeEFaWl91MEFnTzdkbWdvMDg4R0ZveWxOQld0VGIzQWNULUMyaGs9IiwgImF" +
    "haWQiOiAiMDAxRSMwMDAzIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJR" +
    "E9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZUR" +
    "hdGUiOiAiMjAxNi0wMi0wNCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZ" +
    "S5vcmcvbWV0YWRhdGEvMDAxRSUyMzAwMDQiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICI" +
    "yMDE2LTAyLTA0IiwgImhhc2giOiAiN2ZaRGMwRVJxNEZ1U1d6cEkxTGtwcnk5OFllYnp0NU55V" +
    "ThteUV1TWxoMD0iLCAiYWFpZCI6ICIwMDFFIzAwMDQiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN" +
    "0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6I" +
    "CIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAyLTA0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9" +
    "tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDFFJTIzMDAwNSIsICJ0aW1lT2ZMYXN0U" +
    "3RhdHVzQ2hhbmdlIjogIjIwMTYtMDItMDQiLCAiaGFzaCI6ICJ4b1pzQmg1c3Z2aWNqcDdsODV" +
    "FSEdyckRjUkFIeVhHeWZyVFpXNmlnMVl3PSIsICJhYWlkIjogIjAwMUUjMDAwNSIsICJzdGF0d" +
    "XNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiw" +
    "gImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDItMDQifV19LCB7I" +
    "nVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMUUlMjMwMDA" +
    "2IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMi0wNCIsICJoYXNoIjogImtxY" +
    "V8tOXE4U21EWUpmeTRGb3FTZmpIWURpWmE3RFhOSjRPS3hrUnFxSHM9IiwgImFhaWQiOiAiMDA" +
    "xRSMwMDA2IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGS" +
    "UVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjA" +
    "xNi0wMi0wNCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0Y" +
    "WRhdGEvMDAxRSUyMzAwMDciLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAzLTI" +
    "xIiwgImhhc2giOiAiODR2ZHQwUno0VERfczZhQkpJaFNtQ1ZPSld0U2doSzhmRXpKcnVSMDl0T" +
    "T0iLCAiYWFpZCI6ICIwMDFFIzAwMDciLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJ" +
    "GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3Rpd" +
    "mVEYXRlIjogIjIwMTYtMDMtMjEifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWF" +
    "uY2Uub3JnL21ldGFkYXRhLzAwMjAlMjNBMTExIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiO" +
    "iAiMjAxNi0xMS0yMiIsICJoYXNoIjogInhJRTVUZW9fTlJ3cGsxNUFMSURrVFhUdWN3dG9lMXl" +
    "SenhYUzVCYkNzWFU9IiwgImFhaWQiOiAiMDAyMCNBMTExIiwgInN0YXR1c1JlcG9ydHMiOiBbe" +
    "yJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGU" +
    "iOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0xMS0yMiJ9XX0sIHsidXJsIjogImh0dHBzO" +
    "i8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAyMCUyM0EyMDEiLCAidGltZU9mTGF" +
    "zdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAyLTEyIiwgImhhc2giOiAiaFdHNnhHMjB0TjZHTnU2c" +
    "0NIZjBnNVo2WHRrRTNmRWFrazVwQXlqUDBZTT0iLCAiYWFpZCI6ICIwMDIwI0EyMDEiLCAic3R" +
    "hdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogI" +
    "iIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE2LTAyLTEyIn1dfSw" +
    "geyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDIwJTIzQ" +
    "TIwMiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTYtMDItMTIiLCAiaGFzaCI6ICJ" +
    "5SzRqVE1BSlFZMmwtV1dJNm1CWmdmQlpaTkpLZzE3VnhTcm9mT0xFWEhRPSIsICJhYWlkIjogI" +
    "jAwMjAjQTIwMiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlR" +
    "JRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogI" +
    "jIwMTYtMDItMTIifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21" +
    "ldGFkYXRhLzAwMjAlMjNBMjAzIiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wM" +
    "i0xMiIsICJoYXNoIjogIjBiS19DQ2ZDTWd0aWF5amVtOWU3cWtZQ3FiaGw5c3IwcGgzbWR5SUp" +
    "fREE9IiwgImFhaWQiOiAiMDAyMCNBMjAzIiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiO" +
    "iAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImV" +
    "mZmVjdGl2ZURhdGUiOiAiMjAxNi0wMi0xMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZ" +
    "G9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAyMCUyM0EyMDQiLCAidGltZU9mTGFzdFN0YXR1c0N" +
    "oYW5nZSI6ICIyMDE1LTEyLTIyIiwgImhhc2giOiAiZWg3VjRwaU5fVTVCY19mbFBZMzg2RmNoU" +
    "nc1VzN1QXh1MGo4M3FCMlkxbz0iLCAiYWFpZCI6ICIwMDIwI0EyMDQiLCAic3RhdHVzUmVwb3J" +
    "0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljY" +
    "XRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTUtMTItMjIifV19LCB7InVybCI6ICJodHR" +
    "wczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMjAlMjNBMjA1IiwgInRpbWVPZ" +
    "kxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMi0xMiIsICJoYXNoIjogIlhlRk9pTWs2ajFoaE5" +
    "hMm14WEdVaDJyenEtUWZ2TnBRNndFcDZWaFNNWmM9IiwgImFhaWQiOiAiMDAyMCNBMjA1IiwgI" +
    "nN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVybCI" +
    "6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMi0xMiJ9X" +
    "X0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAyMCU" +
    "yM0EyMDYiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAyLTEyIiwgImhhc2giO" +
    "iAiLTc0bjFKMmFtNWRqWGF0WW9IVGt5dnhhcGlRWEtVMU1DNEhuXzVGMEZRST0iLCAiYWFpZCI" +
    "6ICIwMDIwI0EyMDYiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19DR" +
    "VJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI" +
    "6ICIyMDE2LTAyLTEyIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZ" +
    "y9tZXRhZGF0YS8wMDIwJTIzQjIwNCIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTU" +
    "tMTItMjIiLCAiaGFzaCI6ICJVQjk2dHdDX0h2cUpQWENOQjFhWHd5bHNnT0ZyV2dUYi15aE9KL" +
    "W5ZSTJrPSIsICJhYWlkIjogIjAwMjAjQjIwNCIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHV" +
    "zIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZ" +
    "mVjdGl2ZURhdGUiOiAiMjAxNS0xMi0yMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9" +
    "hbGxpYW5jZS5vcmcvbWV0YWRhdGEvMDAyOCUyMzAwMDEiLCAidGltZU9mTGFzdFN0YXR1c0NoY" +
    "W5nZSI6ICIyMDE2LTAzLTIxIiwgImhhc2giOiAiQ2ZZOHItT1M2NmtYNEJNUkFZbkJVcVFHUzc" +
    "0bEk2Vy03SDRzQ2FabEU4Zz0iLCAiYWFpZCI6ICIwMDI4IzAwMDEiLCAic3RhdHVzUmVwb3J0c" +
    "yI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXR" +
    "lIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDMtMjEifV19LCB7InVybCI6ICJodHRwc" +
    "zovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzAwMzElMjMwMDAxIiwgInRpbWVPZkx" +
    "hc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMy0yMiIsICJoYXNoIjogImRhUnlaMUhKQjFtdlYwa" +
    "EtESWx0OUxvcWhnU1Rwamo5Y3ZwT2NmVndWNVE9IiwgImFhaWQiOiAiMDAzMSMwMDAxIiwgInN" +
    "0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsI" +
    "CJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAzLTIyIn1dfSwgeyJ" +
    "1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8wMDMxJTIzMDAwM" +
    "iIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDMtMjIiLCAiaGFzaCI6ICJVUEF" +
    "oVHk1RnhFTEZNdUdOTm0zOFYxdEVEVzVacVc4MmpWMWRjLS02VDFrPSIsICJhYWlkIjogIjAwM" +
    "zEjMDAwMiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiw" +
    "gInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0wM" +
    "y0yMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGE" +
    "vMDAzNyUyMzAwMDEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTExLTI4IiwgI" +
    "mhhc2giOiAiRDRhU0JtYTJfTFdkV2ZpSkhnbW52OFRjMUVSNmZ0QUdVcXFUb2hFZ1pIZz0iLCA" +
    "iYWFpZCI6ICIwMDM3IzAwMDEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX" +
    "0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXR" +
    "lIjogIjIwMTctMTEtMjgifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub" +
    "3JnL21ldGFkYXRhLzA5NkUlMjMwMDA0IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjA" +
    "xNy0wMS0wNCIsICJoYXNoIjogIkFnTjJVbElLQTRXMDFuZ1dEZHlZWXNYVjQzX1cwcWhCVGQxY" +
    "UNaTGdPSUU9IiwgImFhaWQiOiAiMDk2RSMwMDA0IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF" +
    "0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZ" +
    "WZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAxLTA0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZml" +
    "kb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS8xRUE4JTIzODA4MSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ" +
    "2hhbmdlIjogIjIwMTctMDQtMDciLCAiaGFzaCI6ICJqVFZBVlNXR2ZONjN5SzZHQkFkNXhnTk1" +
    "EYWF2eDR5dGZsN0EtUjg1QVRrPSIsICJhYWlkIjogIjFFQTgjODA4MSIsICJzdGF0dXNSZXBvc" +
    "nRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWN" +
    "hdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0wNC0wNyJ9XX0sIHsidXJsIjogImh0d" +
    "HBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvNDc0NiUyMzMyMDgiLCAidGltZU9" +
    "mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTA2LTA3IiwgImhhc2giOiAiRHV1RzRoeEJoZS1Kb" +
    "3hPbjhTek9jZlcwbTVPNk1YTkIzdFZoc09xdTFjOD0iLCAiYWFpZCI6ICI0NzQ2IzMyMDgiLCA" +
    "ic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiI" +
    "iwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDYtMDcifV19LCB" +
    "7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzQ3NDYlMjM1M" +
    "jA2IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMy0wOSIsICJoYXNoIjogIm9" +
    "sQzZ6TjEyUDFpXzdVcUZwTG5mSFhBelVtbWthMVl5VWtfVl9Fd1pyOGM9IiwgImFhaWQiOiAiN" +
    "Dc0NiM1MjA2IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQ" +
    "iLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3L" +
    "TAzLTA5In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF" +
    "0YS80NzQ2JTIzRjgxNiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTUtMTAtMTIiL" +
    "CAiaGFzaCI6ICJQd2hjUkF4d2pReGx3cW9Xb0xoa0VhLTV1dk9tNElEUE13RkdMNWtMRENzPSI" +
    "sICJhYWlkIjogIjQ3NDYjRjgxNiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJR" +
    "E9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZUR" +
    "hdGUiOiAiMjAxNS0xMC0xMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZ" +
    "S5vcmcvbWV0YWRhdGEvNGU0ZSUyMzQwMDUiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICI" +
    "yMDE1LTA5LTE1IiwgImhhc2giOiAiaklGUnNwUGRGYkI2bW9GQnlHYnpTdWtfSDJNUGlxYU96Z" +
    "FQxZ3pmbkJPYz0iLCAiYWFpZCI6ICI0ZTRlIzQwMDUiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN" +
    "0YXR1cyI6ICJOT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6I" +
    "CIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE1LTA5LTE1In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9" +
    "tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwNiIsICJ0aW1lT2ZMYXN0U" +
    "3RhdHVzQ2hhbmdlIjogIjIwMTYtMDMtMTQiLCAiaGFzaCI6ICJPMmo0QzdGbHJ0dy1kZFZHbDF" +
    "WY0NqZnZYYXFDY3c5blB3QjBIMFh6UEo4PSIsICJhYWlkIjogIjRlNGUjNDAwNiIsICJzdGF0d" +
    "XNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiw" +
    "gImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDMtMTQifV19LCB7I" +
    "nVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzRlNGUlMjM0MDA" +
    "5IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMy0xNCIsICJoYXNoIjogImV5T" +
    "E1GNDQ1Y1BMX1RLc2NmWUdlWXJiLWJZWDAyRG5BZGlsdzBLTEdNTG89IiwgImFhaWQiOiAiNGU" +
    "0ZSM0MDA5IiwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGS" +
    "UVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjA" +
    "xNi0wMy0xNCJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0Y" +
    "WRhdGEvNGU0ZSUyMzQwMGEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAzLTE" +
    "0IiwgImhhc2giOiAiVllxaWRHOFk4ZDlENkY3QXJlUWlpck9VVXdLWmoxNTdFakRkVWlnRkNvc" +
    "z0iLCAiYWFpZCI6ICI0ZTRlIzQwMGEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJ" +
    "OT1RfRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZ" +
    "WN0aXZlRGF0ZSI6ICIyMDE2LTAzLTE0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2F" +
    "sbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwYiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhb" +
    "mdlIjogIjIwMTYtMDMtMTQiLCAiaGFzaCI6ICJEU2VfR2U4QkotZXhWV0RReDRQU19lZGRFZWJ" +
    "5Tm4wUUtmRlIxZVRTQlN3PSIsICJhYWlkIjogIjRlNGUjNDAwYiIsICJzdGF0dXNSZXBvcnRzI" +
    "jogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZml" +
    "jYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTYtMDMtMTQifV19LCB7InVybCI6ICJod" +
    "HRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhLzRlNGUlMjM0MDEwIiwgInRpbWV" +
    "PZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNi0wMy0xNCIsICJoYXNoIjogIjBoSUliUjRqZWdQZ" +
    "FhDVjNGZi1ibGMwdS1SbVlaekFSdWo0QVViS1RHcXc9IiwgImFhaWQiOiAiNGU0ZSM0MDEwIiw" +
    "gInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiTk9UX0ZJRE9fQ0VSVElGSUVEIiwgInVyb" +
    "CI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNi0wMy0xNCJ" +
    "9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvNGU0Z" +
    "SUyMzQwMTEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE2LTAzLTE0IiwgImhhc2g" +
    "iOiAibVVLOHJVRGtHQVNqcDVDNjFQUUNFbVN4Um9OSTVpWTJjWkNuRDB6eTlnZz0iLCAiYWFpZ" +
    "CI6ICI0ZTRlIzQwMTEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1RfRklET19" +
    "DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0Z" +
    "SI6ICIyMDE2LTAzLTE0In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9" +
    "yZy9tZXRhZGF0YS85ek1VRmFvVEU4MmlXdTl1SjROeFo4IiwgImhhc2giOiAiRUNTLWp0cnJIM" +
    "mgySkxGeHExSGVJN2V0MldXRTh0VjZHc1IzVTl2c2txcz0iLCAidGltZU9mTGFzdFN0YXR1c0N" +
    "oYW5nZSI6ICIyMDE3LTExLTI4IiwgImF0dGVzdGF0aW9uQ2VydGlmaWNhdGVLZXlJZGVudGlma" +
    "WVycyI6IFsiOTIzODgxZmUyZjIxNGVlNDY1NDg0MzcxYWViNzJlOTdmNWE1OGUwYSJdLCAic3R" +
    "hdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgI" +
    "mNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTctMTEtMjgifV19LCB7InV" +
    "ybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhL2JiRVBtZDM2aHJvc" +
    "2lWYnhCWmNHN2YiLCAiaGFzaCI6ICJHV0FLbEtmVmwxMC1oMmlQQl9uY2hiZWZhcnJiZDFmVG9" +
    "YSXYxWThjS1dZPSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDItMTEiLCAiY" +
    "XR0ZXN0YXRpb25DZXJ0aWZpY2F0ZUtleUlkZW50aWZpZXJzIjogWyI5NDFiNjczODRmZjAzMzM" +
    "wYjcwZGNjYTU4ZjcyMTYzMmYwNDcyNmQyIl0sICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzI" +
    "jogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmV" +
    "jdGl2ZURhdGUiOiAiMjAxNy0wMi0xMSJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hb" +
    "GxpYW5jZS5vcmcvbWV0YWRhdGEvQnoyRExHdHhQYzRkU0RGa2VaNkJUQyIsICJoYXNoIjogIll" +
    "pNzI3SUUtRVJkbEJIT2VyUE54cmExaTZrTnJqalBaX2h3NURkX3FRQm89IiwgInRpbWVPZkxhc" +
    "3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMS0yNCIsICJhdHRlc3RhdGlvbkNlcnRpZmljYXRlS2V" +
    "5SWRlbnRpZmllcnMiOiBbIjQxODM3N2UyMTNkYjE0YWJjNjUwOWRiNWUxMGM5NTk4YjQyZjkyZ" +
    "WEiXSwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJ" +
    "sIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAxLTI0I" +
    "n1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS9EQUI" +
    "4JTIzMDAxMSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTUtMTAtMDIiLCAiaGFza" +
    "CI6ICJ5NGlPSlp1S0x2MUVYa3VXQVFrWFF1QXgzbmI4THZCdFd4OUpMcWlWQjY4PSIsICJhYWl" +
    "kIjogIkRBQjgjMDAxMSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSV" +
    "ElGSUVEIiwgInVybCI6ICIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiA" +
    "iMjAxNS0xMC0wMiJ9XX0sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvb" +
    "WV0YWRhdGEvREFCOCUyMzEwMTEiLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE1LTE" +
    "yLTIzIiwgImhhc2giOiAiYW51TVFoWnpLUnpGSEoyd1ppWVV2RzFyUXFtODd1YU5DeFJNUHh3R" +
    "FZ5ST0iLCAiYWFpZCI6ICJEQUI4IzEwMTEiLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI" +
    "6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY" +
    "3RpdmVEYXRlIjogIjIwMTUtMTItMjMifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWx" +
    "saWFuY2Uub3JnL21ldGFkYXRhL2VTN3Y4c3VtNGp4cDdrZ0xRNVFxY2ciLCAiaGFzaCI6ICJSR" +
    "Hp3dFlDbFdVeWFyVS03WXNLYzg3U2JKUktydG44Q3pIdWlhMjNQRm53PSIsICJ0aW1lT2ZMYXN" +
    "0U3RhdHVzQ2hhbmdlIjogIjIwMTctMDMtMTQiLCAiYXR0ZXN0YXRpb25DZXJ0aWZpY2F0ZUtle" +
    "UlkZW50aWZpZXJzIjogWyJkNWRiNGRkNDhmZTQ2YWZkOGFmOGYxZjdjZmJkZWU2MTY0MGJiYmN" +
    "jIiwgIjU1NDY0ZDViZWE4NGU3MDczMDc0YjIxZDEyMDQ5MzQzNThjN2RiNGQiXSwgInN0YXR1c" +
    "1JlcG9ydHMiOiBbeyJzdGF0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ" +
    "0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAzLTE0In1dfSwgeyJ1cmwiO" +
    "iAiaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS9GYkZaMktGdmk5QkNyVWR" +
    "Tc1pKRFJlIiwgImhhc2giOiAiVWxLdFFJeWhpdXc0VHoySHNfVTcwRGlib0ZzVi1BYlZLTnhLV" +
    "E5VTWpzST0iLCAidGltZU9mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE3LTAyLTA4IiwgImF0dGV" +
    "zdGF0aW9uQ2VydGlmaWNhdGVLZXlJZGVudGlmaWVycyI6IFsiZDNhMTU5OGMwOWRjZDUxMTQyO" +
    "TczZjFiYjdjOGJkNjUyZTkzYjEwNSJdLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJ" +
    "GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3Rpd" +
    "mVEYXRlIjogIjIwMTctMDItMDgifV19LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWF" +
    "uY2Uub3JnL21ldGFkYXRhL0pLUDVDaURlaGRNTVB3dEc1aTd0bzUiLCAiaGFzaCI6ICJCTWI2V" +
    "TlLSWxBTGVuUUJvMktGXzNJZ001ZGRpT0tmSU8wSVc1U19yODN3PSIsICJ0aW1lT2ZMYXN0U3R" +
    "hdHVzQ2hhbmdlIjogIjIwMTctMDMtMDIiLCAiYXR0ZXN0YXRpb25DZXJ0aWZpY2F0ZUtleUlkZ" +
    "W50aWZpZXJzIjogWyJhNWEzNTMwZTAzYTBmMjExODM5OWFjMGI2YzNjOWQ1NTJhMGQzNGY4Il0" +
    "sICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6I" +
    "CIiLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0wMy0wMiJ9XX0" +
    "sIHsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvbU5TUEx1e" +
    "md5RGFWQXpVRzdIQUVOOSIsICJoYXNoIjogImVjWmN4SVhwMjRYeVliR0lkYm11N05oSmc0RzN" +
    "wNnF4UVRhUVcwOG53cmM9IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxOC0wNC0xM" +
    "yIsICJhdHRlc3RhdGlvbkNlcnRpZmljYXRlS2V5SWRlbnRpZmllcnMiOiBbIjJkMDE4OGI5ZTI" +
    "1NTJmZWUwYWI2YTYxMjY0MWRlOTY2ODQxZWJlMmIiLCAiMWVhODljOTE2ZDJhYzNjZjI2MmI3O" +
    "DMyMjk5YzQ4ZDhiNDhjZTMyMyJdLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJOT1R" +
    "fRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZWN0a" +
    "XZlRGF0ZSI6ICIyMDE4LTA0LTEzIn1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZmlkb2FsbGl" +
    "hbmNlLm9yZy9tZXRhZGF0YS9OOVVvN1c0Y05udmE3Mkxxd0dKUm5kIiwgImhhc2giOiAiZVZkS" +
    "0VsWDJqZXg0X1JoRWVxMXVpYjE4RnBPcGYwUUNQNDhyUVgxYkVOYz0iLCAidGltZU9mTGFzdFN" +
    "0YXR1c0NoYW5nZSI6ICIyMDE3LTAyLTIwIiwgImF0dGVzdGF0aW9uQ2VydGlmaWNhdGVLZXlJZ" +
    "GVudGlmaWVycyI6IFsiNmJhYjE5YzZjMDk3ZjE5MDYwY2U1NDA0MDAwMzgwYzMyZmE2YThlNiJ" +
    "dLCAic3RhdHVzUmVwb3J0cyI6IFt7InN0YXR1cyI6ICJGSURPX0NFUlRJRklFRCIsICJ1cmwiO" +
    "iAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTctMDItMjAifV1" +
    "9LCB7InVybCI6ICJodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3JnL21ldGFkYXRhL3VQVGZxQ" +
    "VBiYVpzQ3QydnlldVRqeksiLCAiaGFzaCI6ICJ2U1EybFZnQTZKMW84MEl0MUMteW81WVhpM0t" +
    "BbW15RlJyVmRvSWI1TF9jPSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTctMTEtM" +
    "jgiLCAiYXR0ZXN0YXRpb25DZXJ0aWZpY2F0ZUtleUlkZW50aWZpZXJzIjogWyI2Y2Q5OWQ4YjB" +
    "hYmZhNmE0Mzc4MTM4YTE0NzVmN2U0NmRmMjE3YTI1IiwgIjdhOGZlMzdhNDJiYmYyYTViM2U2N" +
    "Tc0ZDZmMDRiZGJjNTVlNTkwNDciLCAiYzEwYmM0YzZmNjE0YjYzMzcxZDkyOTU5NmVkZWRkZTN" +
    "lNDU4NDA0ZCIsICI3NmU0N2I0N2UzMjgxNGFhYTZhODdjMjgwY2ZjYmQ1Mjc4ODFhNDA0Il0sI" +
    "CJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICI" +
    "iLCAiY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxNy0xMS0yOCJ9XX0sI" +
    "HsidXJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEvVjRmekFkVkZ" +
    "EalE4eGd5NHZrMkRzUSIsICJoYXNoIjogIkQwTGt3OEg2X0E2UFU2SGlSN2NuVnZsSTdOdkFvU" +
    "0lEOVpGdFlPMGJwbXM9IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMi0wOCI" +
    "sICJhdHRlc3RhdGlvbkNlcnRpZmljYXRlS2V5SWRlbnRpZmllcnMiOiBbImM4ODg3MWE0MzhlZ" +
    "jk3YzRkODMyMDdkNmYxNjExMzkyN2FmOGVmM2EiXSwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF" +
    "0dXMiOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZ" +
    "WZmZWN0aXZlRGF0ZSI6ICIyMDE3LTAyLTA4In1dfSwgeyJ1cmwiOiAiaHR0cHM6Ly9tZHMuZml" +
    "kb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS9XUkQ4ejJXUnk5TGU0TmVtR1VLNnZBIiwgImhhc2giO" +
    "iAiMmJ6Q1ZCZVBjSHV3azE3Y250NVVxQktvamRhSmJZVUtpakY0dG1FcTNXcz0iLCAidGltZU9" +
    "mTGFzdFN0YXR1c0NoYW5nZSI6ICIyMDE4LTAyLTA5IiwgImF0dGVzdGF0aW9uQ2VydGlmaWNhd" +
    "GVLZXlJZGVudGlmaWVycyI6IFsiNWZiYzRiYTc1MzA1MjE4N2FhYjNjNzQxZDFmOWVjNmZiM2M" +
    "0ZDg3NSIsICIyZWI5ZmYzNTcyZjY3NjI4ZDEyOTFhM2I1NzkyNGY4MThhYWQ5ZTcyIl0sICJzd" +
    "GF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIkZJRE9fQ0VSVElGSUVEIiwgInVybCI6ICIiLCA" +
    "iY2VydGlmaWNhdGUiOiAiIiwgImVmZmVjdGl2ZURhdGUiOiAiMjAxOC0wMi0wOSJ9XX0sIHsid" +
    "XJsIjogImh0dHBzOi8vbWRzLmZpZG9hbGxpYW5jZS5vcmcvbWV0YWRhdGEveU1VRkNQMnF6anN" +
    "Zc2JIZ0VZWlNWOSIsICJoYXNoIjogIjZKbllrejRURDh1d3NIZVFTcDgtX1lGbWhkQS1wMGthT" +
    "khfN21xQl8wY3M9IiwgInRpbWVPZkxhc3RTdGF0dXNDaGFuZ2UiOiAiMjAxNy0wMy0yMyIsICJ" +
    "hdHRlc3RhdGlvbkNlcnRpZmljYXRlS2V5SWRlbnRpZmllcnMiOiBbImZiZWMxMmM0Mjg3NzRkM" +
    "zFiZTRkNzcyMzY3NThlYTNjMDQxYTJlZDAiXSwgInN0YXR1c1JlcG9ydHMiOiBbeyJzdGF0dXM" +
    "iOiAiRklET19DRVJUSUZJRUQiLCAidXJsIjogIiIsICJjZXJ0aWZpY2F0ZSI6ICIiLCAiZWZmZ" +
    "WN0aXZlRGF0ZSI6ICIyMDE3LTAzLTIzIn1dfV19.XUDpXgWFEy2r2vvJVsk3pxADqu53nGsiF3" +
    "6F6q9aZFqJ_0b6X0eTS_xUggV61vFgX3_FLYtxpwJlBSSdw1__yQ";

    // downloaded Jun 11, 2018
    // [ 923881fe2f214ee465484371aeb72e97f5a58e0a ]
    var mds1U2fEntry = "ew0KICAiYXR0ZXN0YXRpb25DZXJ0aWZpY2F0ZUtleUlkZW50aWZpZX" +
    "JzIjogWw0KICAgICI5MjM4ODFmZTJmMjE0ZWU0NjU0ODQzNzFhZWI3MmU5N2Y1YTU4ZTBhIg0K" +
    "ICBdLA0KICAicHJvdG9jb2xGYW1pbHkiOiAidTJmIiwNCiAgImFzc2VydGlvblNjaGVtZSI6IC" +
    "JVMkZWMUJJTiIsDQogICJkZXNjcmlwdGlvbiI6ICJGZWl0aWFuIEJpb1Bhc3MgRklETyBTZWN1" +
    "cml0eSBLZXkiLA0KICAiYXV0aGVudGljYXRvclZlcnNpb24iOiAxLA0KICAidXB2IjogWw0KIC" +
    "AgIHsNCiAgICAgICJtYWpvciI6IDEsDQogICAgICAibWlub3IiOiAwDQogICAgfQ0KICBdLA0K" +
    "ICAiYXV0aGVudGljYXRpb25BbGdvcml0aG0iOiAxLA0KICAicHVibGljS2V5QWxnQW5kRW5jb2" +
    "RpbmciOiAyNTYsDQogICJhdHRlc3RhdGlvblR5cGVzIjogWw0KICAgIDE1ODc5DQogIF0sDQog" +
    "ICJ1c2VyVmVyaWZpY2F0aW9uRGV0YWlscyI6IFsNCiAgICBbDQogICAgICB7DQogICAgICAgIC" +
    "J1c2VyVmVyaWZpY2F0aW9uIjogMg0KICAgICAgfQ0KICAgIF0NCiAgXSwNCiAgImtleVByb3Rl" +
    "Y3Rpb24iOiAyNiwNCiAgImlzS2V5UmVzdHJpY3RlZCI6IHRydWUsDQogICJpc0ZyZXNoVXNlcl" +
    "ZlcmlmaWNhdGlvblJlcXVpcmVkIjogdHJ1ZSwNCiAgImljb24iOiAiZGF0YTppbWFnZS9wbmc7" +
    "YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFGQUFBQUFVQ0FNQUFBQXRCa3JsQUFBQU" +
    "dYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUJIWnBWRmgw" +
    "V0UxTU9tTnZiUzVoWkc5aVpTNTRiWEFBQUFBQUFEdy9lSEJoWTJ0bGRDQmlaV2RwYmowaTc3dS" +
    "9JaUJwWkQwaVZ6Vk5NRTF3UTJWb2FVaDZjbVZUZWs1VVkzcHJZemxrSWo4K0lEeDRPbmh0Y0cx" +
    "bGRHRWdlRzFzYm5NNmVEMGlZV1J2WW1VNmJuTTZiV1YwWVM4aUlIZzZlRzF3ZEdzOUlrRmtiMk" +
    "psSUZoTlVDQkRiM0psSURVdU5pMWpNREUwSURjNUxqRTFOamM1Tnl3Z01qQXhOQzh3T0M4eU1D" +
    "MHdPVG8xTXpvd01pQWdJQ0FnSUNBZ0lqNGdQSEprWmpwU1JFWWdlRzFzYm5NNmNtUm1QU0pvZE" +
    "hSd09pOHZkM2QzTG5jekxtOXlaeTh4T1RrNUx6QXlMekl5TFhKa1ppMXplVzUwWVhndGJuTWpJ" +
    "ajRnUEhKa1pqcEVaWE5qY21sd2RHbHZiaUJ5WkdZNllXSnZkWFE5SWlJZ2VHMXNibk02ZUcxd1" +
    "BTSm9kSFJ3T2k4dmJuTXVZV1J2WW1VdVkyOXRMM2hoY0M4eExqQXZJaUI0Yld4dWN6cGtZejBp" +
    "YUhSMGNEb3ZMM0IxY213dWIzSm5MMlJqTDJWc1pXMWxiblJ6THpFdU1TOGlJSGh0Ykc1ek9uQm" +
    "9iM1J2YzJodmNEMGlhSFIwY0RvdkwyNXpMbUZrYjJKbExtTnZiUzl3YUc5MGIzTm9iM0F2TVM0" +
    "d0x5SWdlRzFzYm5NNmVHMXdUVTA5SW1oMGRIQTZMeTl1Y3k1aFpHOWlaUzVqYjIwdmVHRndMek" +
    "V1TUM5dGJTOGlJSGh0Ykc1ek9uTjBVbVZtUFNKb2RIUndPaTh2Ym5NdVlXUnZZbVV1WTI5dEwz" +
    "aGhjQzh4TGpBdmMxUjVjR1V2VW1WemIzVnlZMlZTWldZaklpQjRiWEE2UTNKbFlYUnZjbFJ2Yj" +
    "J3OUlrRmtiMkpsSUZCb2IzUnZjMmh2Y0NCRFF5QXlNREUwSUNoTllXTnBiblJ2YzJncElpQjRi" +
    "WEE2UTNKbFlYUmxSR0YwWlQwaU1qQXhOaTB4TWkwek1GUXhORG96TXpvd09Dc3dPRG93TUNJZ2" +
    "VHMXdPazF2WkdsbWVVUmhkR1U5SWpJd01UWXRNVEl0TXpCVU1EYzZNekU2TlRrck1EZzZNREFp" +
    "SUhodGNEcE5aWFJoWkdGMFlVUmhkR1U5SWpJd01UWXRNVEl0TXpCVU1EYzZNekU2TlRrck1EZz" +
    "ZNREFpSUdSak9tWnZjbTFoZEQwaWFXMWhaMlV2Y0c1bklpQndhRzkwYjNOb2IzQTZTR2x6ZEc5" +
    "eWVUMGlNakF4TmkweE1pMHpNRlF4TlRvek1Eb3lOeXN3T0Rvd01DWWplRGs3NXBhSDVMdTJJT2" +
    "FjcXVhZ2grbWltQzB4SU9XM3N1YUprK1c4Z0NZamVFRTdJaUI0YlhCTlRUcEpibk4wWVc1alpV" +
    "bEVQU0o0YlhBdWFXbGtPakpGTnpGQ1JrWkRRelkzUmpFeFJUWTVOemhFUVRsRFFrSTJORFl6Um" +
    "prd0lpQjRiWEJOVFRwRWIyTjFiV1Z1ZEVsRVBTSjRiWEF1Wkdsa09qSkZOekZDUmtaRVF6WTNS" +
    "akV4UlRZNU56aEVRVGxEUWtJMk5EWXpSamt3SWo0Z1BIaHRjRTFOT2tSbGNtbDJaV1JHY205dE" +
    "lITjBVbVZtT21sdWMzUmhibU5sU1VROUluaHRjQzVwYVdRNk1rVTNNVUpHUmtGRE5qZEdNVEZG" +
    "TmprM09FUkJPVU5DUWpZME5qTkdPVEFpSUhOMFVtVm1PbVJ2WTNWdFpXNTBTVVE5SW5odGNDNW" +
    "thV1E2TWtVM01VSkdSa0pETmpkR01URkZOamszT0VSQk9VTkNRalkwTmpOR09UQWlMejRnUEM5" +
    "eVpHWTZSR1Z6WTNKcGNIUnBiMjQrSUR3dmNtUm1PbEpFUmo0Z1BDOTRPbmh0Y0cxbGRHRStJRH" +
    "cvZUhCaFkydGxkQ0JsYm1ROUluSWlQejQ3N0pYRkFBQUFZRkJNVkVYLy8vOEVWcUlYWmF2RzJP" +
    "b3FjTEcyek9Pa3d0MEJTSnRxbGNYVjR1K2F1dGxXaGJ6azdQVUFNWTlIY3JLanROYnE4ZmVBbD" +
    "hhQm9zeno5dnBkanNHR3F0RjNuOHVUc05TWnBjNkpzTlQ1K3YweFlLbnU4UGZmNS9MNDhmZy9m" +
    "cmljekpnWUFBQURBRWxFUVZSNDJrUlVDWmJESUFqRlhaT1kxVGF0TmMzOWJ6a3NTWWMzcjRNRT" +
    "RmTUJBYUQ2emw4eS85VE9nZXQ4ZDVqZk43OGJ3TS9kRENScFI1MjF6WGZvakhKMDVJSXloQkFV" +
    "U1ZBT05kR3pCWXQyZjdLRnJma0phQWtIaDlGWmhjRFhIUmtUS285TUxpaEdhYXZJbW5WM3F5RV" +
    "gwRXByZ3ovNER3VUQ3a0NIUm5kOFFGTjQzR280VVZtRERnemE0dzI3b2l6ZEEyK2NLK3V1VXBq" +
    "am8yK3h3Yy80Mlc1MHg1TEdZZURCc1IwSFZJeDV4OGlGNjBDYmxiVEVFa0ZyMjdiTkRCVVZTcT" +
    "FPS1ZQYkU2MmIzRUg4RnFCZzVPT09FdWMydDhaSmlxTU91R3ArY0tqZzd3VkdjZW96cU40cHhn" +
    "VlBRa2pGWWdiVkpLRFVoRENqWXJhd1A1cTRFVGdDOWZJTVJIdGl0cFFjQ3ZKT0VMY2JNc1Fnbm" +
    "NpUmtsanB5UWp2RzQ0anFCVUVURmlCaTFQRUl5ZWtPenNXK1R5NWNMSG9zNVIrZE1TMUx0U1N4" +
    "ZjNnUUhjelIyQ0k0Z01OcFc0SVJBMVFNYTZ0SjQrQzZ1SHVHRThtTkRJeUZxZy9PUC9NTVV1ZV" +
    "M2SXE4UzkwZEFlQkpTRXkvcUtrSytCTnd6OGNZWTRqYjVKNnU0aVdDSTJCMVo1NkxXNWtFYzRo" +
    "a2RNcHN2VUM1NTg1U1gwUXViY2dOcXlmZ0RGRWNUdCs0MC8wUzVOeDB3YUN3M09La2NPYkE1SW" +
    "4wQVlwMDFwamp3Mm42MjZVRGp0SHdhMjhpSHVUS3F0cnYrcmVXNDFOWjZpR2xyN3V1TEpDZmtG" +
    "dGN0Y0cwNHNnbTFlTlMrWmFEbnBhVEVyR295WDVKSzJpTXo4eHMwbk93V0djUERONDlxYUNkNG" +
    "J6Sm96RFptL2FCSytFb3pMdytYaE5CaVl3SGYwc2lPdTFYUGtHL3pLd3ZxWUtjZlN3REVjSC9v" +
    "VWUwN2VzL1dROHJJeWcyRE9Yajh0amtaZHVEQi9iOGh6RGxsTU1PQ1M1QkVuZDUzNGY4dGkzVV" +
    "pjNGtNczN4THlhZk1Tc0poZEc4WFBxak5rNXRBZ08yNWZlS0NoblZkRGovSjBGTWtPc1UveE1C" +
    "djB3RmhZZUVHZlZIMTNmdURVMHlERkxhNGZjN1JuV0hCZnVURlYydEVtTndhZGM3YWMzVVkyam" +
    "ZCbDdIVDM2ZmUzNGlRTzVtTkNGRkJXMDdLalBncWhPTFUwMXZaOFB1ZVoySkNsRlpOOGprVXM2" +
    "OXVrYTllUHA2K0VmTDRBRjUrTnl3U2Jpckh0Y0I4TWwvZ2t3QUVqa0s2NEtqSFBlQUFBQUFFbE" +
    "ZUa1N1UW1DQyIsDQogICJtYXRjaGVyUHJvdGVjdGlvbiI6IDQsDQogICJhdHRhY2htZW50SGlu" +
    "dCI6IDIsDQogICJpc1NlY29uZEZhY3Rvck9ubHkiOiAidHJ1ZSIsDQogICJ0Y0Rpc3BsYXkiOi" +
    "AwLA0KICAiYXR0ZXN0YXRpb25Sb290Q2VydGlmaWNhdGVzIjogWw0KICAgICJNSUlCZmpDQ0FT" +
    "V2dBd0lCQWdJQkFUQUtCZ2dxaGtqT1BRUURBakFYTVJVd0V3WURWUVFEREF4R1ZDQkdTVVJQSU" +
    "RBeU1EQXdJQmNOTVRZd05UQXhNREF3TURBd1doZ1BNakExTURBMU1ERXdNREF3TURCYU1CY3hG" +
    "VEFUQmdOVkJBTU1ERVpVSUVaSlJFOGdNREl3TURCWk1CTUdCeXFHU000OUFnRUdDQ3FHU000OU" +
    "F3RUhBMElBQk5CbXJScVZPeHp0VEpWTjE5dnRkcWNMN3RLUWVvbDJubk0yL3lZZ3Zrc1pucjUw" +
    "U0tiVmdJRWt6SFFWT3U4MExWRUUzbFZoZU8xSGpnZ3hBbFQ2bzRXallEQmVNQjBHQTFVZERnUV" +
    "dCQlJKRldRdDFidkczak02WGdtVi9JY2pOdE8vQ3pBZkJnTlZIU01FR0RBV2dCUkpGV1F0MWJ2" +
    "RzNqTTZYZ21WL0ljak50Ty9DekFNQmdOVkhSTUVCVEFEQVFIL01BNEdBMVVkRHdFQi93UUVBd0" +
    "lCQmpBS0JnZ3Foa2pPUFFRREFnTkhBREJFQWlBd2ZQcWdJV0lVQitRQkJhVkdzZEh5MHM1Uk14" +
    "bGt6cFNYL3pTeVRabVVwUUlnQjJ3SjZuWlJNOG9YL25BNDNSaDZTSm92TTJYd0NDSC8vK0xpck" +
    "JBYkIwTT0iDQogIF0NCn0=";

    // downloaded Jun 11, 2018
    // 0013#0001
    var mds1UafEntry = "ew0KICAiYWFpZCI6ICIwMDEzIzAwMDEiLA0KICAiYXNzZXJ0aW9uU2" +
    "NoZW1lIjogIlVBRlYxVExWIiwNCiAgImF0dGVzdGF0aW9uUm9vdENlcnRpZmljYXRlcyI6IFsN" +
    "CiAgICAiTUlJREFUQ0NBZW1nQXdJQkFnSUVkYm82dHpBTkJna3Foa2lHOXcwQkFRc0ZBREE0TV" +
    "Fzd0NRWURWUVFHRXdKTFVqRU5NQXNHQTFVRUNnd0VSVlJTU1RFYU1CZ0dBMVVFQXd3UlJWUlNT" +
    "U0JHU1VSUElGSnZiM1FnUTBFd0hoY05NVFV3T1RJMU1EVTBNekV5V2hjTk5EVXdPVEkxTURVME" +
    "16RXlXakE0TVFzd0NRWURWUVFHRXdKTFVqRU5NQXNHQTFVRUNnd0VSVlJTU1RFYU1CZ0dBMVVF" +
    "QXd3UlJWUlNTU0JHU1VSUElGSnZiM1FnUTBFd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SU" +
    "JEd0F3Z2dFS0FvSUJBUUNvMTdJb1VaRnlwSkF2T2p3NmRaaWEyUHFJbjJKazdKWUU2emdUOHNK" +
    "ZC9nK1pKeTk0cUhwcHdIM0U5NDl1Wk1zeHNsTzBLSXl3T1Z2Sk0xbmJDakdlMGJ1NzhCVjJMbH" +
    "BxRE5QTnlDZ1IxN2MyL2VqdkhFcWFLR2orR0ZVS3lpZGlPMzFFTjFkMndBaTB4SHNnUGVpc3Rp" +
    "YjVzY1hQMkRZQ3g3eVdIM05PNEZkTmk1U1BjNjdSd0dVcHJkRFE4SkJXRFkvVmh3ZUU3a20zdn" +
    "cyZnRoWTd3N3RrRFk1NkdlYVg4Wm1sS01wMmZlN3NtWis5UCtNcGt5bWxhMkRieHBvaFJ5THRI" +
    "M0o2OXppdTBvc0NDSWFEcStCS3MxUENaT24vc0JvVHE2WTE5Z21DbE5tS21reWp6ZE5uM3JNa3" +
    "FpcUlVbXRPYmN0KzlHTTBTUWNOZGw1VkFnTUJBQUdqRXpBUk1BOEdBMVVkRXdFQi93UUZNQU1C" +
    "QWY4d0RRWUpLb1pJaHZjTkFRRUxCUUFEZ2dFQkFCaUN0ZkhHWTBCWnU4cTRpSERPMmlPQW9BQU" +
    "xObG8wOUJTU0d1Q0ZEOU1VWkgwOVdEaWdJVmNmOGpYTUNPTE5INVZVU0lmY1c3WE9hYVpxa2JK" +
    "Q2UreXRYaE5YT25IZ0cvZzdEUzFvUk9CWUt5eGVja0huQXJKZlVYelZycERYbU1GL1c5UkQrSD" +
    "lZbXcxOVpWNzR1bDN2Zmd6TkFjVTh3eWV6NGFPdHlpd0h2R3FCeWdjc0tXdDJPakFPK0JoSi9N" +
    "ZUhrRDdRUFJCMExva2hMUTZkcHF6eEJTdUx1M0VDbWhtcHdqUFhYZHZtU1JYdnBkMWtXQWhLZD" +
    "I1Q2V1RHZURm8vNjIyTERwM3c0MU9mbElTeGR1QjRqVTdaTzFBanVjVUoveUFqVEhqZm16UVBm" +
    "Wm9mYWpLeEdiMEVldGdBRURFUXNwamU4ckx4M0FhOUR2aFpxWDA9Ig0KICBdLA0KICAiYXR0ZX" +
    "N0YXRpb25UeXBlcyI6IFsNCiAgICAxNTg3OSwNCiAgICAxNTg4MA0KICBdLA0KICAiZGVzY3Jp" +
    "cHRpb24iOiAiRVRSSSBTVyBBdXRoZW50aWNhdG9yIGZvciBTRUNQMjU2UjFfRUNEU0FfU0hBMj" +
    "U2X1JhdyIsDQogICJpY29uIjogImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FB" +
    "QUFOU1VoRVVnQUFBR0lBQUFBVUNBWUFBQUIyM3VqU0FBQUFCR2RCVFVFQUFMR1BDL3hoQlFBQU" +
    "FDQmpTRkpOQUFCNkpnQUFnSVFBQVBvQUFBQ0E2QUFBZFRBQUFPcGdBQUE2bUFBQUYzQ2N1bEU4" +
    "QUFBQUJtSkxSMFFBL3dEL0FQK2d2YWVUQUFBQUNYQklXWE1BQUE3REFBQU93d0hIYjZoa0FBQU" +
    "FCM1JKVFVVSDN3UVBBekVMMFpiU3J3QUFCaVZKUkVGVVdJWFZXV2xzRlZVVWZvaFM2TUlpU2x4" +
    "K3FJa1E5WS9zaGJSOTdhTW9pK0lmVzJvZ1JrUWlSZi9nUDNIRmhDVyt2dElXRWdJdEZFZ0x0Yk" +
    "g3SW9wR2JjTkRoYkMweEFVb0tnRTBObFdhc25YamZ0NXpaNTk1MC9kbW1McmM1dXRzZCs0OTkz" +
    "eHp6cm5uUEYvR212MElFRjQ3SUIzWEhQQUVORzdtNnhWb2FEMExhZ3kzeERIY2Rna0wxMVlpST" +
    "NlL3AvTXBTTTh0Ui9hNlduUmV1UWFsc1JNdFlLc0RZQ3VTZ1JWelBRTmJNUWZzWlg3K1pqYndS" +
    "UlZZZnk5Zko2MVYrbE5hNTEvWGhVenB1ZnN0T2lKNTN5OXVoUy9lSDBTOFA0OGpKSTVqUEVSU1" +
    "JqNTIxWitTbE1Fa3dab09uOE85VHhkaGRKcTNjeWtZblpxSHljL3Z3S1hPSGxVUitMb09MRFVl" +
    "bU80RFpuZ1BSdU5tVGdTcktBSnVEY3BrMEpxbDZTLyswWU5IdVV4eGFjRUk4Z2F4L04wNitCTF" +
    "NReERJb0dPZVp5QlN4d2J5c1ZzaFF2NUNtc09jaUFWRjRubUMzN3Y1Rkl6aEJFL0owb2dRQ21t" +
    "cEIwdExCQ1BGelJ6aEtkaE1UZ1NkY3pMWWtvZUJqbmJGRG1WQXlFSXlrV3hXZVVOWS9sNjlqZ2" +
    "dWV3Fja1RzN1llZmxjb1NGWG1EQi9DMG9iVCtrRUF6NEpkK0QreGR1UXhFa2FGK205ZVNFeDcx" +
    "REtUZ3JJY2xsa3kwY2lmL2V4cGNVR2l5QWlrSlpnVDhUc080RGtPMlBEN0pFbUlpUUk2NWc3aW" +
    "45cFpUQTNqWWlnWlMza0dXUWk5QThrTXVMVEpiZXlja016OWpTMVlYZkRLVmNvYld6RFQ3OTJH" +
    "WWk0OEhzMzlqYTNDNWNWNloyOWZMNnNkVFZjUUt2UVpFVjN6eS9BMm9MUHNhY3hzbHcwYnNXaD" +
    "czSHRScitKaUVSSldRWVMrUFdza1dEdkxBT3JMUWFxZHd5TjJoS0ErbkxpeUJLc2hIS2lxblpF" +
    "SkdJeUVlRTNyeWtreUxFaFFqb2ZHOWpDRjl0dUdkUk5ZNHFaTWhhMUw3WE5lNDlnVkVyUVlxRk" +
    "V4S1NGUmZqMG0vTXh6eXordDlUWkUwSEs0d3FPUlRLeGlwcGk2UjA3SXFvakV6SEZHUkdhVlpE" +
    "WjAxZm5TV013N0NPTWV3cnpVb0dOZThJeUVWYUxJQ0thRDNkRW1VNE5sOUsxalVXd0dSeXk4bU" +
    "w3UkNEMTVTN0sxaUk4SjRMN1hISUJCL25YUndIV01RN1RzVU80SXIyU1ZlVVk3aGxiTkNLYW9o" +
    "Qmhia081Sm1halBOc21FekhNRm1FTTJCUnNKeTBzZEljRmhUd29iOFcrWnYwdUlyWW1FZkdoRF" +
    "JHRmdtUW56WjZJRVZJQXJ0NnA5WVhlbGlLTVpTRENaM1J6eVJvUmVwdDNTWVR1MnA4bjV4aHVF" +
    "QlJXcGVRUlRscFVJc0xEUk1RdG5uUU84Q0EvT0FBbUE0T0RHbWlzajdkTHU2U3BQaXRvZlA1Y2" +
    "5oV1c3YXN6MTZSZmVGRHNYdHdpa1U5VVVuOVNVOGgvbllqdVA0SFNUV0FiVm9GdFhNMEY0ZGlr" +
    "Unk3WW1reGdYUTVROGdGUXZONEFSdmQrT0NaUHFrWEMyNG9SaWZ6ODhaeGkrRmVYSWMwTlhpM2" +
    "pLWHc1NnVVU2g2ZXVhUmd0Z24xWkRiYm9RYkFuZWQ5cEpreVZzbWlXR3dCKytUSHlYT3J4dGx5" +
    "VHZPQjBLVGtxcWp5RzdxdTk2T3ErNFJvMyt3YitQMFJBeThSQldmSjBPV3RXRXpmcGZWSFNlQ1" +
    "VOT0hmYXBQaklhM1FkcktudTVPbjJWVnRpVEQzL1BTSjA4clUwZ0MxNVNNM0dtUjZ6Wk10WVJX" +
    "UkUzNHk0ZDAxeW5XaDc5WEgwOWczaTJzMSs1N2hCeHo3MER3ekdUTUR3RVdHWDBFV3dDS1p6S2" +
    "pyTHdFek5PaFJpSUpQQnpnMmQrTG9tZ2tvY1ZMTkpYcmtQT1cvWFl1bGJOWTZSemZFQ2YvZlFk" +
    "ejg3VWhxMWY5SWltSWtJSmZtVVR3VVp3akprTjZYV2xwU0NINDI1S2xWbkdTNkppRGZrRDhidE" +
    "szV2lNcTBieEtWS2s1YlVuVlJYNkdUWEZEZEVpYVBKSVJHSWt0QXhOUW16U3FpUWdXZTFtTUVN" +
    "TWNPbml4bnR1dkozaEdCdHFiNkd4RDFCeExRWFM4V0Y5SHNFdVNWdm9KVEJkeG5LNEU1aVJGQl" +
    "lwbkhNa0NpaDMxNUNad0pWVTIwemEyY3hBOEpOdGVtTEt5b1JrN04yU2tUbzljU0pHTTN2TFNN" +
    "aVdrOWN3T0kzS25IZm9xMFluN2tGNCtkNWczRWNFNThxRUJWWUlWS01CVDlxbS9jZEVVSkdrdW" +
    "VCWjdiaFlEaldvcC9jV3JrU0F4TjRQTGdMbUROS0IzNmRNZ2FneXFzZEZZYVkwUUE4OTRoS3FE" +
    "bG1TQUdjdTZrekozVTBBSmM1RVUva2xJZ1AwN3dlK2puZ3BmV044RkhIMzdxdW91YXJNMks3V3" +
    "ZTUmQ5akt4MnZ2NkpTRml0MGl2ajE5R1FVVlIva1lSMDFqSHNYMnF1TTRmK21LTXlJdWNndXFL" +
    "QVRLOGpoQ092RHI4bnpnckgzMno4d3g0N01LWVA0OXdqTDBXMXUxekNIY1ZJcnVCeUtnNTNxZj" +
    "hBeUZwdlhRTmEyVExQeHZ0WGZxbEVZY3R3UUFBQUFsZEVWWWRHUmhkR1U2WTNKbFlYUmxBREl3" +
    "TVRVdE1EUXRNVFZVTURNNk5EazZNVEVyTURJNk1EQVV0VVNmQUFBQUpYUkZXSFJrWVhSbE9tMX" +
    "ZaR2xtZVFBeU1ERTFMVEEwTFRFMVZEQXpPalE1T2pFeEt6QXlPakF3WmVqOEl3QUFBQUJKUlU1" +
    "RXJrSmdnZz09IiwNCiAgInRjRGlzcGxheUNvbnRlbnRUeXBlIjogImltYWdlL3BuZyIsDQogIC" +
    "J0Y0Rpc3BsYXlQTkdDaGFyYWN0ZXJpc3RpY3MiOiBbDQogICAgew0KICAgICAgImJpdERlcHRo" +
    "IjogMTYsDQogICAgICAiY29sb3JUeXBlIjogMiwNCiAgICAgICJjb21wcmVzc2lvbiI6IDAsDQ" +
    "ogICAgICAiZmlsdGVyIjogMCwNCiAgICAgICJoZWlnaHQiOiAyNDAsDQogICAgICAiaW50ZXJs" +
    "YWNlIjogMCwNCiAgICAgICJ3aWR0aCI6IDMyMA0KICAgIH0NCiAgXSwNCiAgInVwdiI6IFsNCi" +
    "AgICB7DQogICAgICAibWFqb3IiOiAxLA0KICAgICAgIm1pbm9yIjogMA0KICAgIH0NCiAgXSwN" +
    "CiAgInVzZXJWZXJpZmljYXRpb25EZXRhaWxzIjogWw0KICAgIFsNCiAgICAgIHsNCiAgICAgIC" +
    "AgInVzZXJWZXJpZmljYXRpb24iOiA0DQogICAgICB9DQogICAgXQ0KICBdLA0KICAiYXR0YWNo" +
    "bWVudEhpbnQiOiAxLA0KICAiYXV0aGVudGljYXRpb25BbGdvcml0aG0iOiAxLA0KICAiYXV0aG" +
    "VudGljYXRvclZlcnNpb24iOiAxLA0KICAiaXNTZWNvbmRGYWN0b3JPbmx5IjogZmFsc2UsDQog" +
    "ICJrZXlQcm90ZWN0aW9uIjogMSwNCiAgIm1hdGNoZXJQcm90ZWN0aW9uIjogMSwNCiAgInB1Ym" +
    "xpY0tleUFsZ0FuZEVuY29kaW5nIjogMjU2LA0KICAidGNEaXNwbGF5IjogMw0KfQ==";

    // downloaded Jun 14, 2018
    // 4e4e#4005
    var mds1UafEntry4e4e4005 = "ew0KICAiYWFpZCI6ICI0ZTRlIzQwMDUiLA0KICAiZGVzY3" +
    "JpcHRpb24iOiAiVG91Y2ggSUQgb3IgUGFzc2NvZGUgQXV0aGVudGljYXRvciIsDQogICJhdXRo" +
    "ZW50aWNhdG9yVmVyc2lvbiI6IDI1NiwNCiAgInVzZXJWZXJpZmljYXRpb25EZXRhaWxzIjogWw" +
    "0KICAgIFsNCiAgICAgIHsNCiAgICAgICAgInVzZXJWZXJpZmljYXRpb24iOiA0LA0KICAgICAg" +
    "ICAiY2FEZXNjIjogew0KICAgICAgICAgICJiYXNlIjogMTAsDQogICAgICAgICAgIm1pbkxlbm" +
    "d0aCI6IDQsDQogICAgICAgICAgIm1heFJldHJpZXMiOiA1LA0KICAgICAgICAgICJibG9ja1Ns" +
    "b3dkb3duIjogNjANCiAgICAgICAgfQ0KICAgICAgfQ0KICAgIF0sDQogICAgWw0KICAgICAgew" +
    "0KICAgICAgICAidXNlclZlcmlmaWNhdGlvbiI6IDIsDQogICAgICAgICJiYURlc2MiOiB7DQog" +
    "ICAgICAgICAgIm1heFJlZmVyZW5jZURhdGFTZXRzIjogNSwNCiAgICAgICAgICAibWF4UmV0cm" +
    "llcyI6IDUsDQogICAgICAgICAgImJsb2NrU2xvd2Rvd24iOiAwDQogICAgICAgIH0NCiAgICAg" +
    "IH0NCiAgICBdDQogIF0sDQogICJhdHRhY2htZW50SGludCI6IDEsDQogICJhdHRlc3RhdGlvbl" +
    "Jvb3RDZXJ0aWZpY2F0ZXMiOiBbDQogICAgDQogIF0sDQogICJrZXlQcm90ZWN0aW9uIjogMiwN" +
    "CiAgIm1hdGNoZXJQcm90ZWN0aW9uIjogMiwNCiAgInRjRGlzcGxheSI6IDEsDQogICJ0Y0Rpc3" +
    "BsYXlDb250ZW50VHlwZSI6ICJ0ZXh0L3BsYWluIiwNCiAgImlzU2Vjb25kRmFjdG9yT25seSI6" +
    "IGZhbHNlLA0KICAiaWNvbiI6ICJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQU" +
    "FBTlNVaEVVZ0FBQUVnQUFBQklDQVlBQUFCVjdiTkhBQUFBQVhOU1IwSUFyczRjNlFBQUFCeHBS" +
    "RTlVQUFBQUFnQUFBQUFBQUFBa0FBQUFLQUFBQUNRQUFBQWtBQUFGSmJ1SjJFa0FBQVR4U1VSQl" +
    "ZIZ0I3Sll4YmlOSEVFVUZKMTRZQzVqSkFnc25Ic09PSFBFQUMyaHlCK0lOTktFek1uU211Y0Jp" +
    "ZVFQeUJtTGduTHlCZUFQU0oxamVnSDZmNmhxVXk5UGFYZzBKTytBQVg5MWRWVjM5LzUvbVFEZk" +
    "g0L0htaXJ3SFYzTytjRUd1QmwwTnl2OThTajR0MXh0MHZVSFhHM1RSWDhHZzVqY0RuNTkvckw0" +
    "REg4QU1iQnhXekZ2d0czZy84SmhoR2tzK1ZMbWExeEpIOUFUSWhHTWhaRjd6MnZOeS9Fdml3OX" +
    "o5U3NhSXJNRyswSlErODdSMzhwWEhEdE5ZNG1LdXBwUW9va1pnSG94WnMvNEVwdUQyQlNpdk90" +
    "V2JhYnA5bzlMemMveEw0c1BjTFdDSWtBcHN3V2Nnb2JkOTI0aXJybllZeHpweU12b09MTUJmNE" +
    "Y4MWNZL1dKVWJrYW9adDdtUGpZaElBL2dSM0xuekRXbWJNd0Fyc2dkMk12bEg1RFdoQlp3aHpt" +
    "ZlU3K05YMzdwdm54SmZFTDJZUXhOK0REMGFZdVFUSmxDM29NNkkwZG1EL0hGU3U5enViOTQwbF" +
    "J1UnFMbUlRNUw4MW9oSUM5UFlsck5TRTBqcmRyRnBuTVg1alo4WXhKNzRrZmhHRGpDQ2taeUJu" +
    "ekk3Y0FrekJMYWhzbjQwcHJtK092bDFQSUdmY2l0d1B0aStPSlVia2FpNWlFR1RIWU5zajZETX" +
    "hpZTIrSlZITVMydjI2VFpPZ2N5Tlp1bEY5UGJOaVMrSm45MGdTT28vWTVIMUFtVE1BeGg1QTdR" +
    "R05aaUJGc3pCQnF6U1dyRUpxUHcrelluZGd4MDRCdndVYTB1TXlOV2MxU0NJeXB4SStKRllaYV" +
    "NaajBBRFpFU3NmV205cDM0SmF1dWxrYlZ1bEY2QTdkMzR2T1k1OFNYeFlac2RFd2krZFNSRlZx" +
    "UWJWeUl4TFRnQUUvUGFjZTk3TTYvQWsrdGIrM05Mak1qVm5OT2dwU01vYzdydmdlWmc2L0xSbU" +
    "RVNTRjSGhNY1hVNjVpQmpPck1ZUDRwMVczK1Z3WkI2dnRFVEVJa3lKdlRzSTYzUmpVTDBQdGZ0" +
    "UmVudWZxQktYZ0NmV2JOaVorK2I0dzZUelcxOWNuZGpwTDRXVzRRWkdhSlZKODVVWkNNK2NmSD" +
    "JvUm9sRENEajl1Y25NeGFnOWgzUzh5YnRMUTlKVWJrYXM1bGtNaUpjR09rTkU4eEV5THphc3Ry" +
    "WkQxS2RTdkdQYkJhUHg2SUs2OStuYkhNYTdBRHNYYWNlbmYxT2ZFbDhjRUdRWENjU0Q2YWVOWW" +
    "k1NG5IbTFXUlg0WWFYNStieXl6dHE1SUpJK2FMMEVjMVp0SXZxaXN4SWxjemJET0hRMllHOUcy" +
    "dzZ6MW03Z1ZHYzFRdkViN21OZk5XNHZYUTZ5SDAyN1B1Ymx0T2ZFbjhIQWJOalF5anpQSGlvem" +
    "w2KzlFTTFTekFIVGk5K1dmWkorRlZpaXV2dXJoM1E4eGVUQlB5Ryt0VFlrU3VackJCUmtKRXdU" +
    "YVE3QVFUbHhndlVJTHZRZmVtbWN2Z0dXZ1RhdXV2a1pqcW8xRTYwMHhhTVBkbnROcVhFMThTSD" +
    "daWnA2Y0hZdEdjeHVXV2dmaWppVklOOHduWWh4b3ZWUHVyVkR0aXJ2MCs3MDFhaDl6YkVpTnlO" +
    "V2N4Q0VMUmdGWmk5SkNiQmNLTDU4enozNTY5WG5pY3oyMHYrNmFoNzBZNVlqTFEzN0ltSjc0a1" +
    "BzZ2dpTHdCSytDRmRBWVFiMEx1aWJYOUhDUmtHL0xxbzVwMWdoZHFaMmlQOVlqOVR3YVM5L0ZO" +
    "aVJHNW1xRUdmWVNNRWRmb3pSbUgzSmZNVVg1c044UkdZdmRnRjNwNWt4WWhkK3BCYkozaS82bE" +
    "JHMGN1bW5Od09kMkVUanh6Q1R3NitMMFY4U1ZRN3puUWVnU2lFVnRub3N5MWZxYzQ2N0hGY3Jl" +
    "akpENzBCa21FaUQwNHNpSjJNSEtNMFJ5Sk56RWF2VGx0eUZsZG8vNnFEZmw1aW5kbXBMelZyN1" +
    "V1TVNKWE05U2dQeUJRaWFRZTVnM3c1a2hnYzBvKzU1ZXNUYlJHYjA3TSticXVqL2FFSHJYNkUv" +
    "UDc5eWxXcXpZbnZpUSt5Q0NSc0FjaTgwQmNOMmZpOGw1QU5LY05lL1dUZVFDN0VCK3JIN0crbj" +
    "FRVmFrOW5xN2JFaUZ6TjN3QUFBUC8vWDlMbFB3QUFCUE5KUkVGVTdWcTdqaU5WRkJ3a0pCQ3N0" +
    "QjBRRWV5MklHU0R6cGFNRHNuV01jbDJTTENTSFJCc052NEF4RGdpUW5ML3dYUkFQaTN4QVRiOG" +
    "dQMEgyMzh3VkxWUG1kb3J6NE54MEczSlY2bzU5OVk1NS9wVXpaMVphVFVYdDdlM0YwL0ZCZGEz" +
    "TC9NQ1dBTzNoZy9rbWVmQ2ZtWTUxcTJBTEhMVlBia3NhblgzbG4xQWtmUlVjVmR0ZkJQYzdLbj" +
    "YyUGRrYzlpTVlkN1pRQkpCOFRtSDQ4TGVoMDdOb2RETzd0Z2J0K3ZlZndOb3VPNWZITGgzRzF4" +
    "cVhJNitmRWlEV2h1Y0FxNkEvbVVjRVBHUU9UU0JnaVlBN3lYbVFCVlJCakhtQWVjbThaazBXZn" +
    "lNM0pBR05USE1CckhrTUZ6WVowQWJPUTNMd1h2ekVQbWQ3cEo4R2IycXZ5L1dVVnZiSFUxd00r" +
    "TmFja01hOUI3RFhISUlMWnhMSUJYdjVsUUg4cFgxOHlYZFo0NXllWHlXem93WlVDVDl6NFkwNk" +
    "RNVHhvR2JaRGdPdlFUMGNtaU9DNklaRTkzQmlEUHZtUUtYd0JXd0FieEgrMFhVZTc2L0srbDVQ" +
    "WmhCSnFqR1VPbXJvWkFwYTdpd1o0M0VNZEtjWXBlOS95dnFTbUFGZVArV1hlRDhYcG5tWERtWV" +
    "FSanV5MlJvQ2FDWVhqeGlEcXlUdW8vTVFXNENVRlJyNEd1c2dFejJZYjhFOUJuNE43ZzNpRFhp" +
    "MXNITmpDc0dNeWlHMmRnd0ZQNldQQmYySExTelBJWFF2RjQwWWdsc0FRbThLeTZzWnhuMXEvaU" +
    "0zUHVENDcyNkt4dmFJQTYvQWR3WUR0amFrQnIyaWdLNGtHT2YrTWZFTmVyN1Y3bTc0Yit2eVQx" +
    "OVRYQzlpVU1iOUZ5allxaTdqT0hMbWxoZG5ZanFEUWFYc3dZeEE5NEFTOERONjVqVFBZcmcrQ3" +
    "BWVjVJUGJzSDlvQWJGTUQ5aElINkhOYVRISmZpOUtPeFRjL2F2aW5lbEMvVWxRSU4xWjN1Z3By" +
    "Vjh5VHpPNUFydXgyQlFiUU5LeUEyNGtnTnlZYzlYd2FHVlo2ejY1QzVmNGR4RURlUEVjZ1hPYn" +
    "RLK2p6WFJvM3Rud2ZXUit6RVlWR0pJRFhpTmZjbkJ0SENlQUozVjdNMEJsd0dwY2JxcllaNzNJ" +
    "UElPOFZ2ZEhUbnZud2RYTW5JTmJoQ0h3UEMvQURuM1dqaVhnQTlQZ1h3SkZXc1FhYzRha1BCRH" +
    "NXWXRGK3B1ck5aZm1IOUdGYlhQR0xsR1lkQnVsRjVFQVJFTFlHdGlKSHdGcm1BdFltb09qWnND" +
    "ZVVUMU1KYlJVMkV2ZmtHT0MxeHJmTm1UOW1VMEJtSElmMnhRQ1dIc3hXdG1uR25pMm1xWjc0Mn" +
    "ptcG5sRy9JNDU4YTFWcnMxdmhTdk9DYURTaHVVeG13QXZvcE13MkkvQVRwQUJ1N05BY2QrcjJX" +
    "dXI3Tis5WFVIT09ZK0Y2ODRHb000RUFiOERiZ0NDZzBZUE1XM2dBUXl1amwxNUZ5NDErZHh6Nz" +
    "dmN2hYM043bDBqY29nSHc2Q0M0QS9LdXNRTHlHTUt5Qm5QU0pyUE5lL0luQnVVSVl6b2JvMmV1" +
    "Zkd2U0tYcnRFWmhJRmZBVnNiWEtJWStXcW1Fb0Y5bGRUTm1RUG5abndJYm1LMVRYRHI0Qlk4SD" +
    "Fxak00aERZdWhVK0FiY0pkQy9qcWlaaFRnYVJ5d2xFUHU1NWVxb3I0MWpieDduYS9VZGlxTTBL" +
    "QVQ5REFIOGZmVEdCOGM1QXhwQXhxVG1GRW11ako3T2VKb3pCL2lqdWpmZFAwZjcwUnFrQVJVcE" +
    "pFUzUwTlFjMW13Qm1kZS9EcHdYeGpYWXMrNVBSdDEvVnh5OVFSRHhBdmdkNkFBSlY1eEtHSElV" +
    "dmJhYVRYQ0ZjZXpqaS9wUmZRL0YwUnRFQVJDVUF6ZUFqT0UrbHpqc2FVSm5lZjR5SjVjQmErTi" +
    "94ZjRMOVQwbW5vUkJFZ0p4cjRIdmRXYkVlUWJJT0VZM3A0MGN1ZWszTDE1KzRyMlAyWitVUVM0" +
    "SWdyOEMvZ2dEWk5BR1o3MmN2N0MvQnQ0Q3o3MzMvK3hQMWlDSmhIaitHUDBBZkFkOEd2aGErV1" +
    "BqWUFZZDg4R24wbnZVLzVXY2lzaGo1andiOU1DZi81d05PaHYwOUQ4UTQ0L20rUVdkWDlCeEwr" +
    "aGZVd1RZeVJDYXJaOEFBQUFBU1VWT1JLNUNZSUk9IiwNCiAgImFzc2VydGlvblNjaGVtZSI6IC" +
    "JVQUZWMVRMViIsDQogICJhdXRoZW50aWNhdGlvbkFsZ29yaXRobSI6IDgsDQogICJwdWJsaWNL" +
    "ZXlBbGdBbmRFbmNvZGluZyI6IDI1OCwNCiAgImF0dGVzdGF0aW9uVHlwZXMiOiBbDQogICAgMT" +
    "U4ODANCiAgXSwNCiAgInVwdiI6IFsNCiAgICB7DQogICAgICAibWFqb3IiOiAxLA0KICAgICAg" +
    "Im1pbm9yIjogMA0KICAgIH0NCiAgXSwNCiAgInRjRGlzcGxheVBOR0NoYXJhY3RlcmlzdGljcy" +
    "I6IFsNCiAgICB7DQogICAgICAid2lkdGgiOiAyMDAsDQogICAgICAiaGVpZ2h0IjogNDAwLA0K" +
    "ICAgICAgImJpdERlcHRoIjogMSwNCiAgICAgICJjb2xvclR5cGUiOiAzLA0KICAgICAgImNvbX" +
    "ByZXNzaW9uIjogMCwNCiAgICAgICJmaWx0ZXIiOiAwLA0KICAgICAgImludGVybGFjZSI6IDAs" +
    "DQogICAgICAicGx0ZSI6IFsNCiAgICAgICAgew0KICAgICAgICAgICJyIjogMjAwLA0KICAgIC" +
    "AgICAgICJnIjogMCwNCiAgICAgICAgICAiYiI6IDANCiAgICAgICAgfSwNCiAgICAgICAgew0K" +
    "ICAgICAgICAgICJyIjogMjE2LA0KICAgICAgICAgICJnIjogMjE2LA0KICAgICAgICAgICJiIj" +
    "ogMjE2DQogICAgICAgIH0NCiAgICAgIF0NCiAgICB9LA0KICAgIHsNCiAgICAgICJ3aWR0aCI6" +
    "IDMwMCwNCiAgICAgICJoZWlnaHQiOiA1MDAsDQogICAgICAiYml0RGVwdGgiOiA4LA0KICAgIC" +
    "AgImNvbG9yVHlwZSI6IDYsDQogICAgICAiY29tcHJlc3Npb24iOiAwLA0KICAgICAgImZpbHRl" +
    "ciI6IDAsDQogICAgICAiaW50ZXJsYWNlIjogMA0KICAgIH0NCiAgXQ0KfQ==";

    // downloaded Jun 6, 2018
    var mds2TocJwt = "eyJhbGciOiAiRVMyNTYiLCAidHlwIjogIkpXVCIsICJ4NWMiOiBbIk1J" +
    "SUNuVENDQWtPZ0F3SUJBZ0lPUnZDTTFhdVU2RllWWFVlYkpIY3dDZ1lJS29aSXpqMEVBd0l3VX" +
    "pFTE1Ba0dBMVVFQmhNQ1ZWTXhGakFVQmdOVkJBb1REVVpKUkU4Z1FXeHNhV0Z1WTJVeEhUQWJC" +
    "Z05WQkFzVEZFMWxkR0ZrWVhSaElGUlBReUJUYVdkdWFXNW5NUTB3Q3dZRFZRUURFd1JEUVMweE" +
    "1CNFhEVEUxTURneE9UQXdNREF3TUZvWERURTRNRGd4T1RBd01EQXdNRm93WkRFTE1Ba0dBMVVF" +
    "QmhNQ1ZWTXhGakFVQmdOVkJBb1REVVpKUkU4Z1FXeHNhV0Z1WTJVeEhUQWJCZ05WQkFzVEZFMW" +
    "xkR0ZrWVhSaElGUlBReUJUYVdkdWFXNW5NUjR3SEFZRFZRUURFeFZOWlhSaFpHRjBZU0JVVDBN" +
    "Z1UybG5ibVZ5SURNd1dUQVRCZ2NxaGtqT1BRSUJCZ2dxaGtqT1BRTUJCd05DQUFTS1grcDNXMm" +
    "oxR1Y0bFF3bjdIWE5qNGxoOWUyd0FhNko5dEJJUWhiUVRrcU12TlpHbkh4T243eVRaM05wWU81" +
    "WkdWZ3IvWEM2NnFsaTdCV0E4amdUZm80SHBNSUhtTUE0R0ExVWREd0VCL3dRRUF3SUd3REFNQm" +
    "dOVkhSTUJBZjhFQWpBQU1CMEdBMVVkRGdRV0JCUmNrTkYrenp4TXVMdm0rcVJqTGVKUWYwRHd5" +
    "ekFmQmdOVkhTTUVHREFXZ0JScEVWNHRhV1NGblphNDF2OWN6Yjg4ZGM5TUdEQTFCZ05WSFI4RU" +
    "xqQXNNQ3FnS0tBbWhpUm9kSFJ3T2k4dmJXUnpMbVpwWkc5aGJHeHBZVzVqWlM1dmNtY3ZRMEV0" +
    "TVM1amNtd3dUd1lEVlIwZ0JFZ3dSakJFQmdzckJnRUVBWUxsSEFFREFUQTFNRE1HQ0NzR0FRVU" +
    "ZCd0lCRmlkb2RIUndjem92TDIxa2N5NW1hV1J2WVd4c2FXRnVZMlV1YjNKbkwzSmxjRzl6YVhS" +
    "dmNua3dDZ1lJS29aSXpqMEVBd0lEU0FBd1JRSWhBTExiWWpCcmJoUGt3cm4zbVFqQ0VSSXdrTU" +
    "5OVC9sZmtwTlhIKzR6alVYRUFpQmFzMmxQNmpwNDRCaDRYK3RCWHFZN3k2MWlqR1JJWkNhQUYx" +
    "S0lsZ3ViMGc9PSIsICJNSUlDc2pDQ0FqaWdBd0lCQWdJT1JxbXhrOE5RdUpmQ0VOVllhMVF3Q2" +
    "dZSUtvWkl6ajBFQXdNd1V6RUxNQWtHQTFVRUJoTUNWVk14RmpBVUJnTlZCQW9URFVaSlJFOGdR" +
    "V3hzYVdGdVkyVXhIVEFiQmdOVkJBc1RGRTFsZEdGa1lYUmhJRlJQUXlCVGFXZHVhVzVuTVEwd0" +
    "N3WURWUVFERXdSU2IyOTBNQjRYRFRFMU1EWXhOekF3TURBd01Gb1hEVFF3TURZeE56QXdNREF3" +
    "TUZvd1V6RUxNQWtHQTFVRUJoTUNWVk14RmpBVUJnTlZCQW9URFVaSlJFOGdRV3hzYVdGdVkyVX" +
    "hIVEFiQmdOVkJBc1RGRTFsZEdGa1lYUmhJRlJQUXlCVGFXZHVhVzVuTVEwd0N3WURWUVFERXdS" +
    "RFFTMHhNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUU5c0RnQzhQekJZbC93S3" +
    "FwWGZhOThqT0lvNzhsOXB6NHhPekdER0l6MHpFWE1Yc0JZNmtBaHlVNEdSbVQwd280dHlVdng1" +
    "Qlk4T0tsc0xNemxiS01SYU9CN3pDQjdEQU9CZ05WSFE4QkFmOEVCQU1DQVFZd0VnWURWUjBUQV" +
    "FIL0JBZ3dCZ0VCL3dJQkFEQWRCZ05WSFE0RUZnUVVhUkZlTFdsa2haMld1TmIvWE0yL1BIWFBU" +
    "Qmd3SHdZRFZSMGpCQmd3Rm9BVTBxVWZDNmYyWXNoQTFOaTl1ZGVPMFZTN3ZFWXdOUVlEVlIwZk" +
    "JDNHdMREFxb0NpZ0pvWWthSFIwY0RvdkwyMWtjeTVtYVdSdllXeHNhV0Z1WTJVdWIzSm5MMUp2" +
    "YjNRdVkzSnNNRThHQTFVZElBUklNRVl3UkFZTEt3WUJCQUdDNVJ3QkF3RXdOVEF6QmdnckJnRU" +
    "ZCUWNDQVJZbmFIUjBjSE02THk5dFpITXVabWxrYjJGc2JHbGhibU5sTG05eVp5OXlaWEJ2YzJs" +
    "MGIzSjVNQW9HQ0NxR1NNNDlCQU1EQTJnQU1HVUNNQkxWcTBKZFd2MnlZNFJwMUlpeUlWV0VLRz" +
    "FQVHoxcFBBRnFFbmFrUHR3NFJNUlRHd0hkYjJpZmNEYlBvRWtmWVFJeEFPTGtmRVBqMjJmQm5l" +
    "ajF3dGd5eWxzdTczcktMVXY0eGhEeTlUQWVWVW1sMGlEQk04U3RFNERpVnMvNGVqRmhxUT09Il" +
    "19.eyJuZXh0VXBkYXRlIjogIjIwMTgtMDYtMTgiLCAiZW50cmllcyI6IFt7InVybCI6ICJodHR" +
    "wczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwNSIsICJ0aW1lT" +
    "2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICJpdVJ2aU1NbkJyWG5" +
    "WcmpJMFRpYWNUektxZEc4VlhUQTZQVXk0cjdTeGhrPSIsICJhYWlkIjogIjRlNGUjNDAwNSIsI" +
    "CJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmw" +
    "iOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkif" +
    "V19LCB7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTR" +
    "lJTIzNDAwNiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFza" +
    "CI6ICI4M1ROeDU2U2ZhNmVJV05DZGttT2hUUTE3T1I4LU5VbUpaWW4xU1Z1UTdNPSIsICJhYWl" +
    "kIjogIjRlNGUjNDAwNiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX" +
    "0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXR" +
    "lIjogIjIwMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlL" +
    "m9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwOSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjI" +
    "wMTgtMDUtMTkiLCAiaGFzaCI6ICJxUURkTFhteUR3d0I4QktabWJZY0F4WTFWTlp0WWs0SXJYR" +
    "zdtdTY0TE9jPSIsICJhYWlkIjogIjRlNGUjNDAwOSIsICJzdGF0dXNSZXBvcnRzIjogW3sic3R" +
    "hdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogI" +
    "iIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21" +
    "kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAwYSIsICJ0aW1lT2ZMYXN0U" +
    "3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICI2VDVzUmlWQThHU0FTQjRRZnZ" +
    "xX1VvTFBfQmJEVXloaWVvVjZoVXdZM0NBPSIsICJhYWlkIjogIjRlNGUjNDAwYSIsICJzdGF0d" +
    "XNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiw" +
    "gImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19LCB7I" +
    "nVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDA" +
    "wYiIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICJpe" +
    "WhEVGRidmdza1d5TWtwSUQ4RG9TdHBIc2Q2Vi1iaThHVVVtTW1xX0ZvPSIsICJhYWlkIjogIjR" +
    "lNGUjNDAwYiIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJR" +
    "klFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjI" +
    "wMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21kczIuZmlkb2FsbGlhbmNlLm9yZy9tZ" +
    "XRhZGF0YS80ZTRlJTIzNDAxMCIsICJ0aW1lT2ZMYXN0U3RhdHVzQ2hhbmdlIjogIjIwMTgtMDU" +
    "tMTkiLCAiaGFzaCI6ICJJMHdzalNGWHB0cUVxLWNXVVBLUXRibEc0STU4eGxQSHlXTWJVc0hNV" +
    "FpFPSIsICJhYWlkIjogIjRlNGUjNDAxMCIsICJzdGF0dXNSZXBvcnRzIjogW3sic3RhdHVzIjo" +
    "gIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnRpZmljYXRlIjogIiIsICJlZ" +
    "mZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19LCB7InVybCI6ICJodHRwczovL21kczIuZml" +
    "kb2FsbGlhbmNlLm9yZy9tZXRhZGF0YS80ZTRlJTIzNDAxMSIsICJ0aW1lT2ZMYXN0U3RhdHVzQ" +
    "2hhbmdlIjogIjIwMTgtMDUtMTkiLCAiaGFzaCI6ICJYVUtXT2EzeFVlV0ZHRGJ4SFU2YWdCQzV" +
    "JV0hHSW1ETVJTZFo2ZW1XZVA0PSIsICJhYWlkIjogIjRlNGUjNDAxMSIsICJzdGF0dXNSZXBvc" +
    "nRzIjogW3sic3RhdHVzIjogIk5PVF9GSURPX0NFUlRJRklFRCIsICJ1cmwiOiAiIiwgImNlcnR" +
    "pZmljYXRlIjogIiIsICJlZmZlY3RpdmVEYXRlIjogIjIwMTgtMDUtMTkifV19XSwgIm5vIjogM" +
    "iwgImxlZ2FsSGVhZGVyIjogIk1ldGFkYXRhIExlZ2FsIEhlYWRlcjogVmVyc2lvbiAxLjAwLlx" +
    "1MzAwMERhdGU6IE1heSAyMSwgMjAxOC4gIFRvIGFjY2VzcywgdmlldyBhbmQgdXNlIGFueSBNZ" +
    "XRhZGF0YSBTdGF0ZW1lbnRzIG9yIHRoZSBUT0MgZmlsZSAoXHUyMDFjTUVUQURBVEFcdTIwMWQ" +
    "pIGZyb20gdGhlIE1EUywgWW91IG11c3QgYmUgYm91bmQgYnkgdGhlIGxhdGVzdCBGSURPIEFsb" +
    "GlhbmNlIE1ldGFkYXRhIFVzYWdlIFRlcm1zIHRoYXQgY2FuIGJlIGZvdW5kIGF0IGh0dHA6Ly9" +
    "tZHMyLmZpZG9hbGxpYW5jZS5vcmcvIC4gSWYgeW91IGFscmVhZHkgaGF2ZSBhIHZhbGlkIHRva" +
    "2VuLCBhY2Nlc3MgdGhlIGFib3ZlIFVSTCBhdHRhY2hpbmcgeW91ciB0b2tlbiBzdWNoIGFzIGh" +
    "0dHA6Ly9tZHMyLmZpZG9hbGxpYW5jZS5vcmc_dG9rZW49WU9VUi1WQUxJRC1UT0tFTi4gIElmI" +
    "FlvdSBoYXZlIG5vdCBlbnRlcmVkIGludG8gdGhlIGFncmVlbWVudCwgcGxlYXNlIHZpc2l0IHR" +
    "oZSByZWdpc3RyYXRpb24gc2l0ZSBmb3VuZCBhdCBodHRwOi8vZmlkb2FsbGlhbmNlLm9yZy9NR" +
    "FMvIGFuZCBlbnRlciBpbnRvIHRoZSBhZ3JlZW1lbnQgYW5kIG9idGFpbiBhIHZhbGlkIHRva2V" +
    "uLiAgWW91IG11c3Qgbm90IHJlZGlzdHJpYnV0ZSB0aGlzIGZpbGUgdG8gYW55IHRoaXJkIHBhc" +
    "nR5LiBSZW1vdmFsIG9mIHRoaXMgTGVnYWwgSGVhZGVyIG9yIG1vZGlmeWluZyBhbnkgcGFydCB" +
    "vZiB0aGlzIGZpbGUgcmVuZGVycyB0aGlzIGZpbGUgaW52YWxpZC4gIFRoZSBpbnRlZ3JpdHkgb" +
    "2YgdGhpcyBmaWxlIGFzIG9yaWdpbmFsbHkgcHJvdmlkZWQgZnJvbSB0aGUgTURTIGlzIHZhbGl" +
    "kYXRlZCBieSB0aGUgaGFzaCB2YWx1ZSBvZiB0aGlzIGZpbGUgdGhhdCBpcyByZWNvcmRlZCBpb" +
    "iB0aGUgTURTLiBUaGUgdXNlIG9mIGludmFsaWQgZmlsZXMgaXMgc3RyaWN0bHkgcHJvaGliaXR" +
    "lZC4gSWYgdGhlIHZlcnNpb24gbnVtYmVyIGZvciB0aGUgTGVnYWwgSGVhZGVyIGlzIHVwZGF0Z" +
    "WQgZnJvbSBWZXJzaW9uIDEuMDAsIHRoZSBNRVRBREFUQSBiZWxvdyBtYXkgYWxzbyBiZSB1cGR" +
    "hdGVkIG9yIG1heSBub3QgYmUgYXZhaWxhYmxlLiBQbGVhc2UgdXNlIHRoZSBNRVRBREFUQSB3a" +
    "XRoIHRoZSBMZWdhbCBIZWFkZXIgd2l0aCB0aGUgbGF0ZXN0IHZlcnNpb24gbnVtYmVyLiAgRGF" +
    "0ZWQ6IDIwMTgtMDUtMjEgVmVyc2lvbiBMSC0xLjAwIn0.5OD_Y5xnINZQ_pqRotaIUC4o-" +
    "9E_BxRmRoqzJqnjUE9Y0vDlF4vEsobcIf7d3EYSxu-qbx6wCcvR-PRg1GNTcA";

    // downloaded Jun 6, 2018
    // 4e4e#4005
    var mds2UafEntry = "eyJhYWlkIjogIjRlNGUjNDAwNSIsICJhc3NlcnRpb25TY2hlbWUiOi" +
    "AiVUFGVjFUTFYiLCAiYXR0YWNobWVudEhpbnQiOiAxLCAiYXR0ZXN0YXRpb25Sb290Q2VydGlm" +
    "aWNhdGVzIjogW10sICJhdHRlc3RhdGlvblR5cGVzIjogWzE1ODgwXSwgImF1dGhlbnRpY2F0aW" +
    "9uQWxnb3JpdGhtIjogOCwgImF1dGhlbnRpY2F0b3JWZXJzaW9uIjogMjU2LCAiZGVzY3JpcHRp" +
    "b24iOiAiVG91Y2ggSUQsIEZhY2UgSUQsIG9yIFBhc3Njb2RlIiwgImljb24iOiAiZGF0YTppbW" +
    "FnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFFZ0FBQUJJQ0FZQUFBQlY3" +
    "Yk5IQUFBQUFYTlNSMElBcnM0YzZRQUFBQnhwUkU5VUFBQUFBZ0FBQUFBQUFBQWtBQUFBS0FBQU" +
    "FDUUFBQUFrQUFBRkpidUoyRWtBQUFUeFNVUkJWSGdCN0pZeGJpTkhFRVVGSjE0WUM1akpBZ3Nu" +
    "SHNPT0hQRUFDMmh5QitJTk5LRXpNblNtdWNCaWVRUHlCbUxnbkx5QmVBUFNKMWplZ0g2ZjZocV" +
    "V5OVBhWGcwSk8rQUFYOTFkVlYzOS81L21RRGZINC9IbWlyd0hWM08rY0VHdUJsME55djk4U2o0" +
    "dDF4dDB2VUhYRzNUUlg4R2c1amNEbjU5L3JMNERIOEFNYkJ4V3pGdndHM2cvOEpoaEdrcytWTG" +
    "1hMXhKSDlBVEloR01oWkY3ejJ2TnkvRXZpdzl6OVNzYUlyTUcrMEpRKzg3UjM4cFhIRHROWTRt" +
    "S3VwcFFvb2taZ0hveFpzLzRFcHVEMkJTaXZPdFdiYWJwOW85THpjL3hMNHNQY0xXQ0lrQXBzd1" +
    "djZ29iZDkyNGlycm5ZWXh6cHlNdm9PTE1CZjRGODFjWS9XSlVia2FvWnQ3bVBqWWhJQS9nUjNM" +
    "bnpEV21iTXdBcnNnZDJNdmxINURXaEJad2h6bWZVNytOWDM3cHZueEpmRUwyWVF4TitERDBhWX" +
    "VRVEpsQzNvTTZJMGRtRC9IRlN1OXp1Yjk0MGxSdVJxTG1JUTVMODFvaElDOVBZbHJOU0UwanJk" +
    "ckZwbk1YNWpaOFl4Sjc0a2ZoR0RqQ0NrWnlCbnpJN2NBa3pCTGFoc240MHBybStPdmwxUElHZm" +
    "NpdHdQdGkrT0pVYmthaTVpRUdUSFlOc2o2RE14aWUyK0pWSE1TMnYyNlRaT2djeU5adWxGOVBi" +
    "TmlTK0puOTBnU09vL1k1SDFBbVRNQXhoNUE3UUdOWmlCRnN6QkJxelNXckVKcVB3K3pZbmRneD" +
    "A0QnZ3VWEwdU15TldjMVNDSXlweEkrSkZZWmFTWmowQURaRVNzZldtOXAzNEphdXVsa2JWdWxG" +
    "NkE3ZDM0dk9ZNThTWHhZWnNkRXdpK2RTUkZWcVFiVnlJeExUZ0FFL1BhY2U5N002L0FrK3RiKz" +
    "NOTGpNalZuTk9ncFNNb2M3cnZnZVpnNi9MUm1EVTU0Y0hoTWNYVTY1aUJqT3JNWVA0cDFXMytW" +
    "d1pCNnZ0RVRFSWt5SnZUc0k2M1JqVUwwUHRmdFJlbnVmcUJLWGdDZldiTmlaKytiNHc2VHpXMT" +
    "ljbmRqcEw0V1c0UVpHYUpWSjg1VVpDTStjZkgyb1JvbERDRGo5dWNuTXhhZzloM1M4eWJ0TFE5" +
    "SlVia2FzNWxrTWlKY0dPa05FOHhFeUx6YXN0clpEMUtkU3ZHUGJCYVB4NklLNjkrbmJITWE3QU" +
    "RzWGFjZW5mMU9mRWw4Y0VHUVhDY1NENmFlTllpNTRuSG0xV1JYNFlhWDUrYnl5enRxNUlKSSth" +
    "TDBFYzFadEl2cWlzeElsY3piRE9IUTJZRzlHMnc2ejFtN2dWR2MxUXZFYjdtTmZOVzR2WFE2eU" +
    "gwMjdQdWJsdE9mRW44SEFiTmpReWp6UEhpb3psNis5RU0xU3pBSFRpOStXZlpKK0ZWaWl1dnVy" +
    "aDNROHhlVEJQeUcrdFRZa1N1WnJCQlJrSkV3VGFRN0FRVGx4Z3ZVSUx2UWZlbW1jdmdHV2dUYX" +
    "V1dmtaanFvMUU2MDB4YU1QZG50TnFYRTE4U0g3WlpwNmNIWXRHY3h1V1dnZmlqaVZJTjh3bllo" +
    "eG92VlB1clZEdGlydjArNzAxYWg5emJFaU55TldjeENFTFJnRlppOUpDYkJjS0w1OHp6MzU2OV" +
    "huaWN6MjB2KzZhaDcwWTVZakxRMzdJbUo3NGtQc2dnaUx3QksrQ0ZkQVlRYjBMdWliWDlIQ1Jr" +
    "Ry9McW81cDFnaGRxWjJpUDlZajlUd2FTOS9GTmlSRzVtcUVHZllTTUVkZm96Um1IM0pmTVVYNX" +
    "NOOFJHWXZkZ0YzcDVreFloZCtwQmJKM2kvNmxCRzBjdW1uTndPZDJFVGp4ekNUdzYrTDBWOFNW" +
    "UTd6blFlZ1NpRVZ0bm9zeTFmcWM0NjdIRmNyZWpKRDcwQmttRWlEMDRzaUoyTUhLTTBSeUpOek" +
    "VhdlRsdHlGbGRvLzZxRGZsNWluZG1wTHpWcjdVdU1TSlhNOVNnUHlCUWlhUWU1ZzN3NWtoZ2Mw" +
    "bys1NWVzVGJSR2IwN00rYnF1ai9hRUhyWDZFL1A3OXlsV3F6WW52aVEreUNDUnNBY2k4MEJjTj" +
    "JmaThsNUFOS2NOZS9XVGVRQzdFQitySDdHK24xUVZhazlucTdiRWlGek4zd0FBQVAvL1g5TGxQ" +
    "d0FBQlBOSlJFRlU3VnE3amlOVkZCd2tKQkNzdEIwUUVleTJJR1NEenBhTURzbldNY2wyU0xDU0" +
    "hSQnNOdjRBeERnaVFuTC93WFJBUGkzeEFUYjhnUDBIMjM4d1ZMVlBtZG9yejROeDBHM0pWNm81" +
    "OTlZNTUvcFV6WjFaYVRVWHQ3ZTNGMC9GQmRhM0wvTUNXQU8zaGcva21lZkNmbVk1MXEyQUxITF" +
    "ZQYmtzYW5YM2xuMUFrZlJVY1ZkdGZCUGM3S242MlBka2M5aU1ZZDdaUUJKQjhUbUg0OExlaDA3" +
    "Tm9kRE83dGdidCt2ZWZ3Tm91TzVmSExoM0cxeHFYSTYrZkVpRFdodWNBcTZBL21VY0VQR1FPVF" +
    "NCZ2lZQTd5WG1RQlZSQmpIbUFlY204WmswV2Z5TTNKQUdOVEhNQnJIa01GellaMEFiT1EzTHdY" +
    "dnpFUG1kN3BKOEdiMnF2eS9XVVZ2YkhVMXdNK05hY2tNYTlCN0RYSElJTFp4TElCWHY1bFFIOH" +
    "BYMTh5WGRaNDV5ZVh5V3pvd1pVQ1Q5ejRZMDZETVR4b0diWkRnT3ZRVDBjbWlPQzZJWkU5M0Jp" +
    "RFB2bVFLWHdCV3dBYnhIKzBYVWU3Ni9LK2w1UFpoQkpxakdVT21yb1pBcGE3aXdaNDNFTWRLY1" +
    "lwZTkveXZxU21BRmVQK1dYZUQ4WHBubVhEbVlRUmp1eTJSb0NhQ1lYanhpRHF5VHVvL01RVzRD" +
    "VUZScjRHdXNnRXoyWWI4RTlCbjRON2czaURYaTFzSE5qQ3NHTXlpRzJkZ3dGUDZXUEJmMkhMU3" +
    "pQSVhRdkY0MFlnbHNBUW04S3k2c1p4bjFxL2lNM1B1RDQ3MjZLeHZhSUE2L0Fkd1lEdGpha0Jy" +
    "MmlnSzRrR09mK01mRU5lcjdWN203NGIrdnlUMTlUWEM5aVVNYjlGeWpZcWk3ak9ITG1saGRuWW" +
    "pxRFFhWHN3WXhBOTRBUzhETjY1alRQWXJnK0NwVlY1SVBic0g5b0FiRk1EOWhJSDZITmFUSEpm" +
    "aTlLT3hUYy9hdmluZWxDL1VsUUlOMVozdWdwclY4eVR6TzVBcnV4MkJRYlFOS3lBMjRrZ055WW" +
    "M5WHdhR1ZaNno2NUM1ZjRkeEVEZVBFY2dYT2J0SytqelhSbzN0bndmV1IrekVZVkdKSURYaU5m" +
    "Y25CdEhDZUFKM1Y3TTBCbHdHcGNicXJZWjczSVBJTzhWdmRIVG52bndkWE1uSU5iaENId1BDL0" +
    "FEbjNXamlYZ0E5UGdYd0pGV3NRYWM0YWtQQkRzV1l0RitwdXJOWmZtSDlHRmJYUEdMbEdZZEJ1" +
    "bEY1RUFSRUxZR3RpSkh3RnJtQXRZbW9PalpzQ2VVVDFNSmJSVTJFdmZrR09DMXhyZk5tVDltVT" +
    "BCbUhJZjJ4UUNXSHN4V3RtbkduaTJtcVo3NDJ6bXBubEcvSTQ1OGExVnJzMXZoU3ZPQ2FEU2h1" +
    "VXhtd0F2b3BNdzJJL0FUcEFCdTdOQWNkK3IyV3VyN04rOVhVSE9PWStGNjg0R29NNEVBYjhEYm" +
    "dDQ2cwWVBNVzNnQVF5dWpsMTVGeTQxK2R4ejc3ZjdoWDNON2wwamNvZ0h3NkNDNEEvS3VzUUx5" +
    "R01LeUJuUFNKclBOZS9JbkJ1VUlZem9ibzJldWZHdlNLWHJ0RVpoSUZmQVZzYlhLSVkrV3FtRW" +
    "9GOWxkVE5tUVBuWm53SWJtSzFUWERyNEJZOEgxcWpNNGhEWXVoVStBYmNKZEMvanFpWmhUZ2FS" +
    "eXdsRVB1NTVlcW9yNDFqYng3bmEvVWRpcU0wS0FUOURBSDhmZlRHQjhjNUF4cEF4cVRtRkVtdW" +
    "pKN09lSm96Qi9panVqZmRQMGY3MFJxa0FSVXBKRVM1ME5RYzFtd0JtZGUvRHB3WHhqWFlzKzVQ" +
    "UnQxL1Z4eTlRUkR4QXZnZDZBQUpWNXhLR0hJVXZiYWFUWENGY2V6amkvcFJmUS9GMFJ0RUFSQ1" +
    "VBemVBak9FK2x6anNhVUpuZWY0eUo1Y0JhK04veGY0TDlUMG1ub1JCRWdKeHI0SHZkV2JFZVFi" +
    "SU9FWTNwNDBjdWVrM0wxNSs0cjJQMlorVVFTNElncjhDL2dnRFpOQUdaNzJjdjdDL0J0NEN6Nz" +
    "MzLyt4UDFpQ0poSGorR1AwQWZBZDhHdmhhK1dQallBWWQ4OEduMG52VS81V2Npc2hqNWp3YjlN" +
    "Q2YvNXdOT2h2MDlEOFE0NC9tK1FXZFg5QnhMK2hmVXdUWXlSQ2FyWjhBQUFBQVNVVk9SSzVDWU" +
    "lJPSIsICJpc1NlY29uZEZhY3Rvck9ubHkiOiBmYWxzZSwgImtleVByb3RlY3Rpb24iOiA2LCAi" +
    "bGVnYWxIZWFkZXIiOiAiTWV0YWRhdGEgTGVnYWwgSGVhZGVyOiBWZXJzaW9uIDEuMDAuXHUzMD" +
    "AwRGF0ZTogTWF5IDIxLCAyMDE4LiAgVG8gYWNjZXNzLCB2aWV3IGFuZCB1c2UgYW55IE1ldGFk" +
    "YXRhIFN0YXRlbWVudHMgb3IgdGhlIFRPQyBmaWxlIChcdTIwMWNNRVRBREFUQVx1MjAxZCkgZn" +
    "JvbSB0aGUgTURTLCBZb3UgbXVzdCBiZSBib3VuZCBieSB0aGUgbGF0ZXN0IEZJRE8gQWxsaWFu" +
    "Y2UgTWV0YWRhdGEgVXNhZ2UgVGVybXMgdGhhdCBjYW4gYmUgZm91bmQgYXQgaHR0cDovL21kcz" +
    "IuZmlkb2FsbGlhbmNlLm9yZy8gLiBJZiB5b3UgYWxyZWFkeSBoYXZlIGEgdmFsaWQgdG9rZW4s" +
    "IGFjY2VzcyB0aGUgYWJvdmUgVVJMIGF0dGFjaGluZyB5b3VyIHRva2VuIHN1Y2ggYXMgaHR0cD" +
    "ovL21kczIuZmlkb2FsbGlhbmNlLm9yZz90b2tlbj1ZT1VSLVZBTElELVRPS0VOLiAgSWYgWW91" +
    "IGhhdmUgbm90IGVudGVyZWQgaW50byB0aGUgYWdyZWVtZW50LCBwbGVhc2UgdmlzaXQgdGhlIH" +
    "JlZ2lzdHJhdGlvbiBzaXRlIGZvdW5kIGF0IGh0dHA6Ly9maWRvYWxsaWFuY2Uub3JnL01EUy8g" +
    "YW5kIGVudGVyIGludG8gdGhlIGFncmVlbWVudCBhbmQgb2J0YWluIGEgdmFsaWQgdG9rZW4uIC" +
    "BZb3UgbXVzdCBub3QgcmVkaXN0cmlidXRlIHRoaXMgZmlsZSB0byBhbnkgdGhpcmQgcGFydHku" +
    "IFJlbW92YWwgb2YgdGhpcyBMZWdhbCBIZWFkZXIgb3IgbW9kaWZ5aW5nIGFueSBwYXJ0IG9mIH" +
    "RoaXMgZmlsZSByZW5kZXJzIHRoaXMgZmlsZSBpbnZhbGlkLiAgVGhlIGludGVncml0eSBvZiB0" +
    "aGlzIGZpbGUgYXMgb3JpZ2luYWxseSBwcm92aWRlZCBmcm9tIHRoZSBNRFMgaXMgdmFsaWRhdG" +
    "VkIGJ5IHRoZSBoYXNoIHZhbHVlIG9mIHRoaXMgZmlsZSB0aGF0IGlzIHJlY29yZGVkIGluIHRo" +
    "ZSBNRFMuIFRoZSB1c2Ugb2YgaW52YWxpZCBmaWxlcyBpcyBzdHJpY3RseSBwcm9oaWJpdGVkLi" +
    "BJZiB0aGUgdmVyc2lvbiBudW1iZXIgZm9yIHRoZSBMZWdhbCBIZWFkZXIgaXMgdXBkYXRlZCBm" +
    "cm9tIFZlcnNpb24gMS4wMCwgdGhlIE1FVEFEQVRBIGJlbG93IG1heSBhbHNvIGJlIHVwZGF0ZW" +
    "Qgb3IgbWF5IG5vdCBiZSBhdmFpbGFibGUuIFBsZWFzZSB1c2UgdGhlIE1FVEFEQVRBIHdpdGgg" +
    "dGhlIExlZ2FsIEhlYWRlciB3aXRoIHRoZSBsYXRlc3QgdmVyc2lvbiBudW1iZXIuICBEYXRlZD" +
    "ogMjAxOC0wNS0yMSBWZXJzaW9uIExILTEuMDAiLCAibWF0Y2hlclByb3RlY3Rpb24iOiAyLCAi" +
    "cHJvdG9jb2xGYW1pbHkiOiAidWFmIiwgInB1YmxpY0tleUFsZ0FuZEVuY29kaW5nIjogMjU4LC" +
    "AidGNEaXNwbGF5IjogMSwgInRjRGlzcGxheUNvbnRlbnRUeXBlIjogInRleHQvcGxhaW4iLCAi" +
    "dXB2IjogW3sibWFqb3IiOiAxLCAibWlub3IiOiAxfSwgeyJtYWpvciI6IDEsICJtaW5vciI6ID" +
    "B9XSwgInVzZXJWZXJpZmljYXRpb25EZXRhaWxzIjogW1t7ImNhRGVzYyI6IHsiYmFzZSI6IDEw" +
    "LCAiYmxvY2tTbG93ZG93biI6IDYwLCAibWF4UmV0cmllcyI6IDUsICJtaW5MZW5ndGgiOiA0fS" +
    "wgInVzZXJWZXJpZmljYXRpb24iOiA0fV0sIFt7ImJhRGVzYyI6IHsiYmxvY2tTbG93ZG93biI6" +
    "IDAsICJtYXhSZWZlcmVuY2VEYXRhU2V0cyI6IDUsICJtYXhSZXRyaWVzIjogNX0sICJ1c2VyVm" +
    "VyaWZpY2F0aW9uIjogMn1dXX0=";

    // https://mds.fidoalliance.org/Root.cer
    var mdsRootCert =
        "-----BEGIN CERTIFICATE-----\n" +
        "MIICQzCCAcigAwIBAgIORqmxkzowRM99NQZJurcwCgYIKoZIzj0EAwMwUzELMAkG\n" +
        "A1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxsaWFuY2UxHTAbBgNVBAsTFE1ldGFk\n" +
        "YXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRSb290MB4XDTE1MDYxNzAwMDAwMFoX\n" +
        "DTQ1MDYxNzAwMDAwMFowUzELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxs\n" +
        "aWFuY2UxHTAbBgNVBAsTFE1ldGFkYXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRS\n" +
        "b290MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEFEoo+6jdxg6oUuOloqPjK/nVGyY+\n" +
        "AXCFz1i5JR4OPeFJs+my143ai0p34EX4R1Xxm9xGi9n8F+RxLjLNPHtlkB3X4ims\n" +
        "rfIx7QcEImx1cMTgu5zUiwxLX1ookVhIRSoso2MwYTAOBgNVHQ8BAf8EBAMCAQYw\n" +
        "DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU0qUfC6f2YshA1Ni9udeO0VS7vEYw\n" +
        "HwYDVR0jBBgwFoAU0qUfC6f2YshA1Ni9udeO0VS7vEYwCgYIKoZIzj0EAwMDaQAw\n" +
        "ZgIxAKulGbSFkDSZusGjbNkAhAkqTkLWo3GrN5nRBNNk2Q4BlG+AvM5q9wa5WciW\n" +
        "DcMdeQIxAMOEzOFsxX9Bo0h4LOFE5y5H8bdPFYW+l5gy1tQiJv+5NUyM2IBB55XU\n" +
        "YjdBz56jSA==\n" +
        "-----END CERTIFICATE-----\n";

    // https://mds.fidoalliance.org/Root.crl
    var mdsRootCrl =
        "-----BEGIN X509 CRL-----\n" +
        "MIIBLTCBswIBATAKBggqhkjOPQQDAzBTMQswCQYDVQQGEwJVUzEWMBQGA1UEChMN\n" +
        "RklETyBBbGxpYW5jZTEdMBsGA1UECxMUTWV0YWRhdGEgVE9DIFNpZ25pbmcxDTAL\n" +
        "BgNVBAMTBFJvb3QXDTE4MDQwNzAwMDAwMFoXDTE4MDcxNTAwMDAwMFqgLzAtMAoG\n" +
        "A1UdFAQDAgEMMB8GA1UdIwQYMBaAFNKlHwun9mLIQNTYvbnXjtFUu7xGMAoGCCqG\n" +
        "SM49BAMDA2kAMGYCMQCnXSfNppE9vpsGtY9DsPWyR3aVVSPs6i5/3A21a1+rCNoa\n" +
        "1cJNWKZJ7IV4cdjIXVUCMQCDh8U8OekdTnuvcG3FaoMJO0y0C0FS5dbTzcuiADjy\n" +
        "VbAQeaSsCauVySzyB3lVVgE=\n" +
        "-----END X509 CRL-----\n";

    // http://mds.fidoalliance.org/CA-1.crl
    var ca1Crl =
        "-----BEGIN X509 CRL-----\n" +
        "MIIBDTCBswIBATAKBggqhkjOPQQDAjBTMQswCQYDVQQGEwJVUzEWMBQGA1UEChMN\n" +
        "RklETyBBbGxpYW5jZTEdMBsGA1UECxMUTWV0YWRhdGEgVE9DIFNpZ25pbmcxDTAL\n" +
        "BgNVBAMTBENBLTEXDTE4MDYwNzAwMDAwMFoXDTE4MDcxNTAwMDAwMFqgLzAtMAoG\n" +
        "A1UdFAQDAgEkMB8GA1UdIwQYMBaAFGkRXi1pZIWdlrjW/1zNvzx1z0wYMAoGCCqG\n" +
        "SM49BAMCA0kAMEYCIQDEDFIsNHgOZUUolm0XIyyGO5Qrr7byVtjfkd7nTfpAlAIh\n" +
        "AIBctNT3uR9vLosOHQexvhp2EL/KO9cALAk6HaVwL/LD\n" +
        "-----END X509 CRL-----\n";

    var mdsIntermediateCert =
        "-----BEGIN CERTIFICATE-----\n" +
        "MIICsjCCAjigAwIBAgIORqmxk8NQuJfCENVYa1QwCgYIKoZIzj0EAwMwUzELMAkG\n" +
        "A1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxsaWFuY2UxHTAbBgNVBAsTFE1ldGFk\n" +
        "YXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRSb290MB4XDTE1MDYxNzAwMDAwMFoX\n" +
        "DTQwMDYxNzAwMDAwMFowUzELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxs\n" +
        "aWFuY2UxHTAbBgNVBAsTFE1ldGFkYXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRD\n" +
        "QS0xMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9sDgC8PzBYl/wKqpXfa98jOI\n" +
        "o78l9pz4xOzGDGIz0zEXMXsBY6kAhyU4GRmT0wo4tyUvx5BY8OKlsLMzlbKMRaOB\n" +
        "7zCB7DAOBgNVHQ8BAf8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4E\n" +
        "FgQUaRFeLWlkhZ2WuNb/XM2/PHXPTBgwHwYDVR0jBBgwFoAU0qUfC6f2YshA1Ni9\n" +
        "udeO0VS7vEYwNQYDVR0fBC4wLDAqoCigJoYkaHR0cDovL21kcy5maWRvYWxsaWFu\n" +
        "Y2Uub3JnL1Jvb3QuY3JsME8GA1UdIARIMEYwRAYLKwYBBAGC5RwBAwEwNTAzBggr\n" +
        "BgEFBQcCARYnaHR0cHM6Ly9tZHMuZmlkb2FsbGlhbmNlLm9yZy9yZXBvc2l0b3J5\n" +
        "MAoGCCqGSM49BAMDA2gAMGUCMBLVq0JdWv2yY4Rp1IiyIVWEKG1PTz1pPAFqEnak\n" +
        "Ptw4RMRTGwHdb2ifcDbPoEkfYQIxAOLkfEPj22fBnej1wtgyylsu73rKLUv4xhDy\n" +
        "9TAeVUml0iDBM8StE4DiVs/4ejFhqQ==\n" +
        "-----END CERTIFICATE-----\n";

    var mdsSigningCert =
        "-----BEGIN CERTIFICATE-----\n" +
        "MIICnTCCAkOgAwIBAgIORvCM1auU6FYVXUebJHcwCgYIKoZIzj0EAwIwUzELMAkG\n" +
        "A1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxsaWFuY2UxHTAbBgNVBAsTFE1ldGFk\n" +
        "YXRhIFRPQyBTaWduaW5nMQ0wCwYDVQQDEwRDQS0xMB4XDTE1MDgxOTAwMDAwMFoX\n" +
        "DTE4MDgxOTAwMDAwMFowZDELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUZJRE8gQWxs\n" +
        "aWFuY2UxHTAbBgNVBAsTFE1ldGFkYXRhIFRPQyBTaWduaW5nMR4wHAYDVQQDExVN\n" +
        "ZXRhZGF0YSBUT0MgU2lnbmVyIDMwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASK\n" +
        "X+p3W2j1GV4lQwn7HXNj4lh9e2wAa6J9tBIQhbQTkqMvNZGnHxOn7yTZ3NpYO5ZG\n" +
        "Vgr/XC66qli7BWA8jgTfo4HpMIHmMA4GA1UdDwEB/wQEAwIGwDAMBgNVHRMBAf8E\n" +
        "AjAAMB0GA1UdDgQWBBRckNF+zzxMuLvm+qRjLeJQf0DwyzAfBgNVHSMEGDAWgBRp\n" +
        "EV4taWSFnZa41v9czb88dc9MGDA1BgNVHR8ELjAsMCqgKKAmhiRodHRwOi8vbWRz\n" +
        "LmZpZG9hbGxpYW5jZS5vcmcvQ0EtMS5jcmwwTwYDVR0gBEgwRjBEBgsrBgEEAYLl\n" +
        "HAEDATA1MDMGCCsGAQUFBwIBFidodHRwczovL21kcy5maWRvYWxsaWFuY2Uub3Jn\n" +
        "L3JlcG9zaXRvcnkwCgYIKoZIzj0EAwIDSAAwRQIhALLbYjBrbhPkwrn3mQjCERIw\n" +
        "kMNNT/lfkpNXH+4zjUXEAiBas2lP6jp44Bh4X+tBXqY7y61ijGRIZCaAF1KIlgub\n" +
        "0g==\n" +
        "-----END CERTIFICATE-----\n";

    var mds = {
        mds1TocJwt,
        mds1U2fEntry,
        mds1UafEntry,
        mds1UafEntry4e4e4005,
        mds2TocJwt,
        mds2UafEntry,
        mdsRootCert,
        mdsRootCrl,
        ca1Crl,
        mdsIntermediateCert,
        mdsSigningCert
    };

    /********************************************************************************
     *********************************************************************************
     * NAKED FIELDS
     *********************************************************************************
     *********************************************************************************/
    // var clientDataJsonBuf = makeCredentialAttestationNoneResponse.response.clientDataJSON;
    // var clientDataJsonObj = {
    //     challenge: "33EHav-jZ1v9qwH783aU-j0ARx6r5o-YHh-wd7C6jPbd7Wh6ytbIZosIIACehwf9-s6hXhySHO-HHUjEwZS29w",
    //     clientExtensions: {},
    //     hashAlgorithm: "SHA-256",
    //     origin: "https://localhost:8443",
    //     type: "webauthn.create"
    // };
    // var authDataNoneArray = [
    //     0x49, 0x96, 0x0D, 0xE5, 0x88, 0x0E, 0x8C, 0x68, 0x74, 0x34, 0x17, 0x0F, 0x64, 0x76, 0x60, 0x5B,
    //     0x8F, 0xE4, 0xAE, 0xB9, 0xA2, 0x86, 0x32, 0xC7, 0x99, 0x5C, 0xF3, 0xBA, 0x83, 0x1D, 0x97, 0x63,
    //     0x41, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    //     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xA2, 0x00, 0x08, 0xA2, 0xDD, 0x5E, 0xAC, 0x1A, 0x86, 0xA8,
    //     0xCD, 0x6E, 0xD3, 0x6C, 0xD6, 0x98, 0x94, 0x96, 0x89, 0xE5, 0xBA, 0xFC, 0x4E, 0xB0, 0x5F, 0x45,
    //     0x79, 0xE8, 0x7D, 0x93, 0xBA, 0x97, 0x6B, 0x2E, 0x73, 0x76, 0xB9, 0xB6, 0xDF, 0xD7, 0x16, 0xE1,
    //     0x64, 0x14, 0x0F, 0xF9, 0x79, 0xA6, 0xD4, 0xF3, 0x44, 0xB5, 0x3D, 0x6D, 0x26, 0xE0, 0x86, 0x7B,
    //     0xF4, 0x14, 0xB6, 0x91, 0x03, 0xBB, 0x65, 0xCB, 0xB2, 0xDA, 0xF7, 0xF4, 0x11, 0x28, 0x35, 0xF0,
    //     0x64, 0xCB, 0x1B, 0x59, 0xA8, 0xE5, 0x84, 0xA4, 0x21, 0xDA, 0x8B, 0xD8, 0x9E, 0x38, 0x7A, 0x0B,
    //     0x7E, 0xEA, 0xB7, 0x23, 0xEC, 0xD7, 0x9D, 0x48, 0x4C, 0x31, 0x6B, 0xFB, 0xAE, 0xC5, 0x46, 0x01,
    //     0xB4, 0x73, 0x67, 0x49, 0x0A, 0x83, 0x9A, 0xDA, 0x14, 0x01, 0xF3, 0x3D, 0x2D, 0x25, 0x8B, 0x97,
    //     0xAE, 0x41, 0x8C, 0xA5, 0x59, 0x34, 0x65, 0x29, 0xF5, 0xAA, 0x37, 0xDE, 0x63, 0x12, 0x75, 0x57,
    //     0xD0, 0x43, 0x46, 0xC7, 0xCD, 0xEE, 0xBD, 0x25, 0x54, 0x2F, 0x2C, 0x17, 0xFC, 0x39, 0x38, 0x99,
    //     0x52, 0xA2, 0x6C, 0x3A, 0xE2, 0xA6, 0xA6, 0xA5, 0x1C, 0xA5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01,
    //     0x21, 0x58, 0x20, 0xBB, 0x11, 0xCD, 0xDD, 0x6E, 0x9E, 0x86, 0x9D, 0x15, 0x59, 0x72, 0x9A, 0x30,
    //     0xD8, 0x9E, 0xD4, 0x9F, 0x36, 0x31, 0x52, 0x42, 0x15, 0x96, 0x12, 0x71, 0xAB, 0xBB, 0xE2, 0x8D,
    //     0x7B, 0x73, 0x1F, 0x22, 0x58, 0x20, 0xDB, 0xD6, 0x39, 0x13, 0x2E, 0x2E, 0xE5, 0x61, 0x96, 0x5B,
    //     0x83, 0x05, 0x30, 0xA6, 0xA0, 0x24, 0xF1, 0x09, 0x88, 0x88, 0xF3, 0x13, 0x55, 0x05, 0x15, 0x92,
    //     0x11, 0x84, 0xC8, 0x6A, 0xCA, 0xC3
    // ];
    // var authDataFromNone = new Uint8Array(authDataNoneArray).buffer;
    // var authDataU2fArray = [];
    // var authDataFromU2f = new Uint8Array(authDataU2fArray).buffer;

    // var rpIdHashArray = [
    //     0x49, 0x96, 0x0D, 0xE5, 0x88, 0x0E, 0x8C, 0x68, 0x74, 0x34, 0x17, 0x0F, 0x64, 0x76, 0x60, 0x5B,
    //     0x8F, 0xE4, 0xAE, 0xB9, 0xA2, 0x86, 0x32, 0xC7, 0x99, 0x5C, 0xF3, 0xBA, 0x83, 0x1D, 0x97, 0x63
    // ];
    // var rpIdHash = new Uint8Array(rpIdHashArray).buffer;

    // var naked = {
    //     clientDataJsonBuf,
    //     clientDataJsonObj,
    //     authDataFromNone,
    //     authDataFromU2f,
    //     rpIdHash
    // };

    return {
        functions,
        server,
        lib,
        certs,
        mds,
        // naked
    };
})); /* end AMD module */
