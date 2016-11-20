
if (navigator.userAgent.indexOf("Safari") == -1) {
    console = new Object();
    console.log = function(log) {
        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("src", "ios-log:#iOS#" + log);
        iframe.setAttribute("border", "0");
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
    }
    console.debug = console.log;
    console.info = console.log;
    console.warn = console.log;
    console.error = console.log;
}
var android= (navigator.userAgent.indexOf("Android") != -1);

console.log("lepton.js android="+android);

function Lepton(trace,backgroundColor,backgroundGradient) {
    var self = this;
    var commandQueue = "";
    var cqDelimiter = "&";

    try {
        self.version = localStorage.lepton_version;
    } catch (e) {
        self.version = '"0.0.0"';
    }

    self.div = document.createElement('div');
    self.trace = trace;

    if (self.trace) console.log("Starting Lepton intialization");

    self.setParent = function(parent) {
        parent.appendChild(self.div);
    }

    self.setSize = function(w,h,diag) {
        console.log("setSize("+w+","+h+","+diag+")");
        self.width = w;
        self.height = h;
        if (!diag) {
            if (w == 1024 || h == 1024)
                diag = 9.7;
            else if (w == 480 || h == 480)
                diag = 3.5;
            else
                diag = 7;
        }
        var c = "body"+w+"x"+h+" bodyDiag"+Math.round(diag-0.01);
        console.log("CSS: "+c);
        document.body.setAttribute("class",c);
        return true;
    }

    self.exec = function( command ) {
        if (trace) console.log("Exec: "+command);
        if ( android )
        {
            jsinterface.exec(command);
        }
        else
            commandQueue = commandQueue+cqDelimiter+command;
    }

    self.getCommands = function() {
        var t = commandQueue;
        commandQueue = "";
        return t;
    }

    self.fireEvent = function(event) {
        if (event.indexOf("(") == -1)
            setTimeout(self.clientEvents[event],0);
        else {
            setTimeout(function(event) {
                return function() {
                    var paren = event.indexOf("(");
                    var eventID = event.substring(0,paren);
                    var argsList = event.substring(paren+1, event.indexOf(")")).split(",");
                    if (eventID == "version") {
                        self.version = argsList[0].replace(/"/g,'');
                        try {
                            localStorage.lepton_version = self.version;
                        } catch (e) {}
                        var vs = self.version.split(".");
                        if (vs[0] > 2 || (vs[0] == 2) && (vs[1] > 0)) { // Use \n as the delimiter on versions after 2.0.x
                            cqDelimiter = "\n";
                        }
                    }
                    self.clientEvents[eventID].apply(self, argsList);
                }
            }(event), 0);
        }
    }

    // Local cache of precondition states for scripts.
    // Render side needs to keep this up to date.
    // Key is script ID, value is true or false
    self.preconditions = {};

    // Local cache of scene state (current parameter and id values of sequences)
    // Key is attribute, value is value
    self.sceneState = {};

    // List of hotspots which must be tracked by the rendering engine
    self.hotspots = {};

// Event handlers which may be installed by the caller
   self.clientEvents = {
       // Called when the user initiates a measure operation
       'measure' : function(fromX, fromY, fromZ, toX, toY, toZ, distMM) { if (self.trace) console.log("Unhandled client event: Measure: "+fromX+" "+fromY+" "+fromZ+" "+toX+" "+toY+" "+toZ+" "+distMM); } ,
       // Called when the user initiates a measure operation
       'hideMeasure' : function() { if (self.trace) console.log("Unhandled client event: Hide Measure"); } ,
       // Called when a script finishes execution (preconditions and hotspots will be updated before this is called)
       'scriptDone' : function() { if (self.trace) console.log("Unhandled client event: Script Done"); },
       // Called after one or more attributes in the scene state have changed
       'sceneStateChange' : function() { if (self.trace) console.log("Unhandled client event: Scene State Change"); },
       // Called when the scene is changing in some way
       'sceneChanging' : function() { if (self.trace) console.log("Unhandled client event: Scene Changing"); },
       // Called when the scene is not changing in any way
       'sceneStable' : function() { if (self.trace) console.log("Unhandled client event: Scene Stable"); },
       // Called when the tracked hotspot moves
       'trackHotspot' : function(id, screenX, screenY) { if (self.trace) console.log("Unhandled client event: Track Hot Spot: "+id+" "+screenX+" "+screenY) },
       // Called when an update is available
       'updateAvailable' : function() { if (self.trace) console.log("Unhandled client event: Update available") },
       // Called to inform client of Lepton version (for diagnostics)
       'version' : function(v) { if (self.trace) console.log("Unhandled client event: Version: "+v) },
       // Called when the user triggers the Android-provided system back button
       'systemBack' : function() { if (self.trace) console.log("Unhandled client event: System Back") },
   }

    // Create a div at the bottom of the pile, and set up all
    // the event handlers to send to the rendering engine
    self.div.style.position = "absolute";
    self.setup = function() {
        if (self.trace) console.log("Setup: "+window.innerWidth+"x"+window.innerHeight);

        self.div.style.zIndex = "0";
        self.div.style.top = "0";
        self.div.style.left = "0";
        self.div.style.width = window.innerWidth+"px";
        self.div.style.height = window.innerHeight+"px";

//        alert("setup "+self.div.style.width+"x"+self.div.style.height);
    }
    //window.addEventListener("orientationchange", self.setup());

    self.disableEvent = function(e) {
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue= false;
        return false;
    }

    if (self.trace) console.log("Installing event listeners");

    self.div.addEventListener("touchstart", function(e) {
        //if (self.trace) console.log("Touch Start "+e);
        var com = "touchstart";
        for( var j=0; j<e.touches.length; j++)
            com = com+" "+e.touches[j].screenX+" "+e.touches[j].screenY;
        self.exec(com);
        return self.disableEvent(e);
    });
    self.div.addEventListener("touchmove", function(e) {
        //if (self.trace) console.log("Touch Move "+e);
        var com = "touchmove";
        for( var j=0; j<e.touches.length; j++)
            com = com+" "+e.touches[j].screenX+" "+e.touches[j].screenY;
        self.exec(com);
        return self.disableEvent(e);
    });
    self.div.addEventListener("touchend", function(e) {
        //if (self.trace) console.log("Touch End "+e);
        var com = "touchend";
        for( var j=0; j<e.touches.length; j++)
            com = com+" "+e.touches[j].screenX+" "+e.touches[j].screenY;
        self.exec(com);
        return self.disableEvent(e);
    });
    /* These listeners are not used
    self.div.addEventListener("touchcancel", function(e) {
        if (self.trace) console.log("Touch Cancel "+e);
        return self.disableEvent(e);
    });
    self.div.addEventListener("gesturestart", function(e) {
        if (self.trace) console.log("Gesture Start "+e);
        return self.disableEvent(e);
    });
    self.div.addEventListener("gesturechange", function(e) {
        if (self.trace) console.log("Gesture Change "+e);
        return self.disableEvent(e);
    });
    self.div.addEventListener("gestureend", function(e) {
        if (self.trace) console.log("Gesture End "+e);
        return self.disableEvent(e);
    });
    self.div.addEventListener("mousedown", function(e) {
        if (self.trace) console.log("Mouse Down "+e);
        return self.disableEvent(e);
    });
    self.div.addEventListener("mousemove", function(e) {
        if (self.trace) console.log("Mouse Move "+e);
        return self.disableEvent(e);
    });
    self.div.addEventListener("mouseup", function(e) {
        if (self.trace) console.log("Mouse Up "+e);
        return self.disableEvent(e);
    });
    */
    // Install handlers for various events
    self.setEventHandler = function(eventName, handlerFunc) {
        self.clientEvents[eventName] = handlerFunc;

        return self;
    }

    // Load a 3D model from a relative or absolute URL.
    // Relative URLs are relative to the starting URL of this application.
    self.load3DModel = function(url) {
        self.exec('load '+url);
        return self;
    }

    // Unload a 3D model.
    // Rendering engine will render background only.
    self.unload3DModel = function() {
        self.exec('unload');
        return self;
    }

    // Reset the 3D model back to its init state
    self.reset = function() {
        self.sceneState = {};
        self.exec('reset');
        return self;
    }

    // Control availability of gesture handlers
    // Important! Must be called AFTER load3DModel. If not called default is rotate=true, pan=true, zoom=true, measure=true
    self.enableModes = function(rotate, pan, zoom, measure) {
        if (self.trace) console.log("Gesture Handlers: ["+(rotate?"X":" ")+"] Rotate ["+(pan?"X":" ")+"] Pan ["+(zoom?"X":" ")+"] Zoom ["+(rotate?"X":" ")+"] Measure");
        self.exec("modes "+rotate+" "+pan+" "+zoom+" "+measure);
        return self;
    }

    // Check whether the preconditions are true for a script
    self.checkPreconditions = function(scriptID) {
        var result = self.preconditions[scriptID];
        //if (self.trace) console.log("Check Preconditions for "+scriptID+": "+result);
        return result;
    }

    // Access to current scene state
    self.getSceneState = function(attribute) {
        var result = self.sceneState[attribute];
        //if (self.trace) console.log("Scene State["+attribute+"] = "+result);
        return result;
    }

    // Play a script at its normal rate (if its preconditions are met)
    self.playScript = function(scriptID) {
        self.exec('playScript '+scriptID);
        return self;
    }

    // Play a script at its normal rate after starting it slowly for the first second (if its preconditions are met)
    self.playStartSlow = function(scriptID) {
        if (self.trace) console.log("Play (start slow) Script "+scriptID);
        self.exec('playScript '+scriptID); // TODO. For now just regular playScript is called
//        alert("playStartSlow not implemented");
        return self;
    }

    // Play a script instantly (jump to the state at the end of the script)
    self.playInstantly = function(scriptID) {
        if (self.trace) console.log("!!! not implemented: Play Instantly "+scriptID);
        //alert("playInstantly not implemented");
        return self;
    }

    // Jump to a particular time (seconds) within a script (play instantly up to that time)
    self.jumpToTime = function(scriptID, time) {
        self.exec('jumpToTime '+scriptID+' '+time); // TODO: the function works improperly for now, it plays to the time with the regular speed. Fix it later.
        //alert("jumpToTime not properly implemented");
        return self;
    }

    // Set a sequence to a parametric value
    self.setSequenceP = function(sequenceID, p) {
        self.exec('setSequenceP '+sequenceID+' '+p);
        return self;
    }

    // Set a sequence to a named value
    self.setSequenceID = function(sequenceID, waypointID) {
        self.exec('setSequenceID '+sequenceID+' '+waypointID);
        return self;
    }

    // Set the camera
    self.setCamera = function(fov, cx, cy) {
        self.exec('setCamera '+fov+' '+cx+' '+cy);
        return self;
    }

    // Create a hotspot which will be updated by the rendering engine
    self.createHotspot = function(hotspotID, objectID, x, y, z, radius, alwaysVisible, updateEveryFrame) {
        var hotspot = {
            // Set by the caller
            'hotspotID' : hotspotID,
            'objectID' : objectID,
            'x' : x,
            'y' : y,
            'z' : z,
            'radius' : radius,
            'alwaysVisible' : alwaysVisible,
            'updateEveryFrame' : updateEveryFrame,
            // Updated by the rendering engine when scripts are not running, or more frequently if updateEveryFrame==true
            'visible' : false,
            'screenX' : 0,
            'screenY' : 0,
            'screenRadius' : 0,
        }
        self.hotspots[hotspotID] = hotspot;
        self.exec("hotspot "+hotspotID+" "+objectID+" "+x+" "+y+" "+z+" "+radius+" "+alwaysVisible+" "+updateEveryFrame);
        return hotspot;
    }

    self.trackHotspot = function(id) {
        self.exec("trackhotspot "+id);
    }

    self.updateHotspots = function(visible) {
//alert('updateHotspots called');
        for( h in self.hotspots ) {
            self.hotspots[h].visible = visible;
        }
    }

    self.mapCameraInput = function(material, camera) {
        self.exec("mapcamerainput "+material+" "+camera);
    }

    self.playVideoTexture = function(material, video, loop) {
        self.exec("playvideotexture "+material+" "+video+" "+loop);
    }

    self.updateHotspot = function( hotspotID, screenX, screenY, screenRadius, visible ) {
        //alert("update hotspot "+hotspotID);
        var h = self.hotspots[hotspotID];
        if ( h!=null ) {
            h['screenX']=screenX;
            h['screenY']=screenY;
            h['screenRadius']=screenRadius;
            h['visible']=visible;
        //alert("update hotspot "+hotspotID+" "+screenX+" "+screenY+" vis="+h['visible']);
        }
//        else
//            alert("hotspot "+hotspotID+" not found");
    }


    self.updateContent = function() {
        self.exec('updateContent');
    }

    self.setToolbarHeight = function(h) {
        self.exec('settoolbarheight '+h);
    }

    // Application should call this with (true) to indicate that it can handle a system back event, or (false) to indicate that we are at the top of navigation.
    self.setSystemBack = function(handled) {
        self.exec('setsystemback '+handled);
    }

    //
    // AUDIO API
    //

    // Create a sound resource, using a file (relative to the top directory) and associate it with an id (string)
    // If a sound with that ID already exists, stop playing it and free its resources
    self.audioCreate = function(id, file) {
        console.log("audiocreate "+id+" "+file);
        self.exec("audiocreate "+id+" "+file);
    }

    // Play ASAP
    self.audioPlay = function(id, loop) {
        self.exec("audioplay "+id+" "+loop);
    }

    // Pause ASAP
    self.audioPause = function(id) {
        self.exec("audiopause "+id);
    }

    // Seek now and either start playing right away, or not (true/false)
    self.audioSeek = function(id, time, play) {
        self.exec("audioseek "+id+" "+time+" "+play);
    }

    // Set volume from the current level, down to the goal level, over a period of time (which may be zero)
    self.audioVolume = function(id, goal, time) {
        self.exec("audiovolume "+id+" "+goal+" "+time);
    }

    // Free an audio resource. Stop playing it if necessary.
    self.audioDispose = function(id) {
        self.exec("audiodispose "+id);
    }

    self.setup();

    if (self.trace) console.log("Adding Lepton interaction DIV to body");

    document.body.appendChild(self.div);

    if ( backgroundColor )
        self.exec("bgcolor "+backgroundColor);
    else
        self.exec("bgcolor 0 0 0");
    if ( backgroundGradient )
        self.exec("bggrad "+backgroundGradient);
    self.exec("requestSize");

    if (self.trace) console.log("Initialization complete");

    return self;
}