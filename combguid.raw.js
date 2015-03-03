 function generateCombGuid() {
            function LongToByteArray(/*long*/longvalue) {
                // we want to represent the input as a 8-bytes array
                var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

                for (var index = 0; index < byteArray.length; index++) {
                    var abyte = longvalue & 0xff;
                    byteArray[index] = abyte;
                    longvalue = (longvalue - abyte) / 256;
                }
                return byteArray;
            }

            function BytesToHex(bytes) {
                for (var hex = [], i = 0; i < bytes.length; i++) {
                    hex.push((bytes[i] >>> 4).toString(16));
                    hex.push((bytes[i] & 0xF).toString(16));
                }
                return hex.join("");
            }

            //http://stackoverflow.com/a/2117523/173949
            var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

            guid = guid.substr(0, 24);

            var days = moment().diff(moment([1900, 1, 1]), 'days');
            var daysBytes = LongToByteArray(days).reverse();
            daysBytes = daysBytes.slice(daysBytes.length - 2);
            var daysHex = BytesToHex(daysBytes);

            var msecs = Math.floor(moment().diff(moment().startOf('day')) / 3.333333);
            var msecsBytes = LongToByteArray(msecs).reverse();
            msecsBytes = msecsBytes.slice(msecsBytes.length - 4);
            var msecsHex = BytesToHex(msecsBytes);

            guid = guid + daysHex + msecsHex;

            return guid;
        }
