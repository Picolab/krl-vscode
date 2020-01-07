ruleset helloWorld {
	meta {
		shares __testing, helloWorld
		provides helloWorld
	}
	global {
		__testing = { "queries": [  //{ "name": "channel", "args":["value","collection","filtered"] },
                                // {"name":"skyQuery" , "args":["eci", "mod", "func", "params","_host","_path","_root_url"]},
                                {"name":"helloWorld" , "args":[]}
                                //{"name":"children" , "args":["name", "allowRogue"]},
                                ],
                  "events": [
                              { "domain": "wrangler", "type": "child_creation",
                                "attrs": [ "name" , "rids"] },
		] }
		
		helloWorld = function() {
			"Hello World!"
		}
	}

}