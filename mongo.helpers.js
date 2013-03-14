(function () {

    // Better show dbs
    shellHelper.show = function (what) {
        assert(typeof what == "string");

        var args = what.split(/\s+/);
        what = args[0];
        args = args.splice(1);

        if (what == "profile") {
            if (db.system.profile.count() == 0) {
                print("db.system.profile is empty");
                print("Use db.setProfilingLevel(2) will enable profiling");
                print("Use db.system.profile.find() to show raw profile entries");
            }
            else {
                print();
                db.system.profile.find({ millis: { $gt: 0} }).sort({ $natural: -1 }).limit(5).forEach(
                    function (x) {
                        print("" + x.op + "\t" + x.ns + " " + x.millis + "ms " + String(x.ts).substring(0, 24));
                        var l = "";
                        for (var z in x) {
                            if (z == "op" || z == "ns" || z == "millis" || z == "ts")
                                continue;

                            var val = x[z];
                            var mytype = typeof(val);

                            if (mytype == "string" ||
                                mytype == "number")
                                l += z + ":" + val + " ";
                            else if (mytype == "object")
                                l += z + ":" + tojson(val) + " ";
                            else if (mytype == "boolean")
                                l += z + " ";
                            else
                                l += z + ":" + val + " ";

                        }
                        print(l);
                        print("\n");
                    }
                )
            }
            return "";
        }

        if (what == "users") {
            db.system.users.find().forEach(printjson);
            return "";
        }

        if (what == "collections" || what == "tables") {
            db.getCollectionNames().forEach(function (x) {
                print(x)
            });
            return "";
        }

        if (what == "dbs" || what == "databases") {
            var dbs = db.getMongo().getDBs();
            var size = {};
            dbs.databases.forEach(function (x) {
                size[x.name] = x.sizeOnDisk;
            });
            var names = dbs.databases.map(function (z) {
                return z.name;
            }).sort();
            var max_name_size = Math.max.apply(Math, names.map(
                function (name) {
                    return name.length
                }
            ));
            names.forEach(function (n) {
                var padding = new Array(max_name_size - n.length + 2).join(" ");
                print(colorize(n, "blue") + padding + "\t" + (size[n] > 1 ? (size[n] / 1024 / 1024 / 1024).toFixed(3) + "GB" : "(empty)"));
            });
            //db.getMongo().getDBNames().sort().forEach(function (x) { print(x) });
            return "";
        }

        if (what == "log") {
            var n = "global";
            if (args.length > 0)
                n = args[0]

            var res = db.adminCommand({ getLog: n });
            if (!res.ok) {
                print("Error while trying to show " + n + " log: " + res.errmsg);
                return "";
            }
            for (var i = 0; i < res.log.length; i++) {
                print(res.log[i])
            }
            return ""
        }

        if (what == "logs") {
            var res = db.adminCommand({ getLog: "*" })
            if (!res.ok) {
                print("Error while trying to show logs: " + res.errmsg);
                return "";
            }
            for (var i = 0; i < res.names.length; i++) {
                print(res.names[i])
            }
            return ""
        }

        if (what == "startupWarnings") {
            var dbDeclared, ex;
            try {
                // !!db essentially casts db to a boolean
                // Will throw a reference exception if db hasn't been declared.
                dbDeclared = !!db;
            } catch (ex) {
                dbDeclared = false;
            }
            if (dbDeclared) {
                var res = db.adminCommand({ getLog: "startupWarnings" });
                if (res.ok) {
                    if (res.log.length == 0) {
                        return "";
                    }
                    print("Server has startup warnings: ");
                    for (var i = 0; i < res.log.length; i++) {
                        print(res.log[i])
                    }
                    return "";
                } else if (res.errmsg == "unauthorized") {
                    // Don't print of startupWarnings command failed due to auth
                    return "";
                } else {
                    print("Error while trying to show server startup warnings: " + res.errmsg);
                    return "";
                }
            } else {
                print("Cannot show startupWarnings, \"db\" is not set");
                return "";
            }
        }

        throw "don't know how to show [" + what + "]";

    };

    shellHelper.find = function (query) {
        assert(typeof query == "string");

        var args = query.split(/\s+/);
        query = args[0];
        args = args.splice(1);

        if (query !== "") {
            var regexp = new RegExp(query, "i");
            var result = db.runCommand("listCommands");
            for (var command in result.commands) {
                var commandObj = result.commands[command];
                var help = commandObj.help;
                if (commandObj.help.indexOf('\n') != -1) {
                    help = commandObj.help.substring(0, commandObj.help.lastIndexOf('\n'));
                }
                if (regexp.test(command) || regexp.test(help)) {
                    var numSpaces = 30 - command.length;
                    print(colorize(command, 'green'), Array(numSpaces).join(" "), "-", help);
                }
            }
        }
    };

})();
