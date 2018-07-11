
// Entry 에 대한 mock API.
// 브라우저에서 테스트를 위해서 사용한다.
// 세번째 인자로 true가 들어가면 function call이라는 의미고, 아니면 trigger이다.
(function() {
	function console_log() {
		console.log('%c[EGN] '+ arguments[0], 'color: #088;', Array.prototype.slice.call(arguments, 1));
	}
	engine.mock('GetLobbyUrl', function () {
		return "http://localhost:23847";
	}, true);

	engine.mock('GetLayoutMode', function () {
		return "NoSystemMenu";
	}, true);

	engine.mock('GetClientAuthData', function () {

		var getUriParameterByName = function (name, url) {
			if (!url) {
				url = window.location.href;
			}
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		}

		var fullClientGameVersion = "1.2.3.4";
		var rst = {
			platformType:"None",
			userSerial: "76561198031450358",
			fullGameVersion: fullClientGameVersion,
			//+ Math.floor((Math.random() * 100) + 1),
		};

		var appid = getUriParameterByName("appid");
		if (appid != null)
		{
			rst.appId = appid;
			rst.accessToken = getUriParameterByName("token");
		}
		else
		{
			rst.app = "bro";
			var id = getUriParameterByName("id");
			if (id)
				rst.id = id;
		}
		rst.playerNetId = getUriParameterByName("netid") || rst.id || "NetId_" + Math.floor(Math.random() * 1000000);

		console_log(rst);

		return rst;

	}, true);

	engine.mock('GetDisplayResoultions', function () {
		return [
			{ X: 1024, Y: 768 },
			{ X: 1280, Y: 1024},
			{ X: 1920, Y: 1024 },
		];
	}, true);

	engine.mock('GetCurrentOptions', function () {
		return {
			resolution: '1280x1024',
			//resolution: '1280x124',
			quality: 'Low',
			fullscreen: 'true',
			gamma: '20',
			aim: '20',
			invertY:'false',
		};
	}, true);

	engine.mock('GetMapNames', function () {
		return ['Sanctuary', 'Highrise'];
	}, true);

	engine.mock('GetJoinMapNames', function () {
		return ['Any', 'Sanctuary', 'Highrise'];
	}, true);

	engine.mock('GetSearchServerResult', function () {
		return {
			bFinish: true,
			statusText: "Status message",
			entryList: [
				{
					serverName: 'Server1',
					currentPlayers: 5,
					maxPlayers: 12,
					gameType: 'FFA',
					mapName: 'TestMap',
					ping: 201,
					searchResultsIndex: 0,
				},
				{
					serverName: 'Server2',
					currentPlayers: 15,
					maxPlayers: 22,
					gameType: 'FFA',
					mapName: 'TestMap2',
					ping: 101,
					searchResultsIndex: 1,
				},
			],
		};
	}, true);

	engine.mock('IsXYRunning', function() {
		return false;
	}, true);

	engine.mock('CheckXYInstalledAndExecute', function(r, args) {
		console_log('checkxy');
		return false;
	}, true);

	var gameVersion = '1.2.3';
	engine.mock('GetGameVersion', function () {
		return gameVersion;
	}, true);

	engine.mock('SetGameVersion', function (version) {
		gameVersion = version;
		return version;
	})

	engine.mock('OpenExternalBrowser', function(u) {
		window.open(u);
		console_log('Engine', u);
	}, true);
	///////////////////////////////////////////////////////////////////////////////
	// 여기서 부터 이벤트.
	engine.mock('Quit', function () {
		console_log('engine received Quit!!!!');
	});

	engine.mock('UpdateOptions', function (options) {
		console_log('engine received options');
		console_log(options);
	});

	engine.mock('StartHost', function (options) {
		console_log('engine received StartHost');
		console_log(options);
	});

	engine.mock('StartSearchJoin', function (options) {
		console_log('engine received StartSearchJoin');
		console_log(options);

		window.setTimeout(function () { engine.trigger('BeginServerSearch'); }, 1000);
	});

	engine.mock('JoinToServer', function (serverIndex) {
		console_log('engine received JoinToServer');
		console_log(serverIndex);
	});

	engine.mock('JoinToDedicatedServer', function (serverAddress, udpEncryptionKey) {
		console_log('engine received JoinToDedicatedServer:' + serverAddress + udpEncryptionKey);
	});

	engine.mock('InputFocusChange', function (isFocusIn) {
		console_log('engine received InputFocusChange:' + isFocusIn);
	});

	engine.mock('UdpPingTest', function (addr, interval, count) {
		setTimeout(function () {
			const pings = {
				'52.214.163.230:31112': 250,
				'13.125.109.210:31112': 50,
				'54.248.196.205:31112': 150,
				'35.153.218.241:31112': 150,
				'13.229.164.235:31112': 120,
				'18.231.45.91:31112': 350,
				'13.210.157.45:31112': 200,
			}
			console.log('MOCK REPLY')
			const target = pings[addr] || 800;
			engine.trigger('UdpPingTestResult', addr, (1 + Math.random()/5)*target, 100)
		}, 1200);
	});

	// functions for debugging skin in browser {{{
	var debugSkin = true;
	var slots = [];
	var update = 0;
	function resizeSlot(newSize) {
		if (newSize > slots.length) {
			while(newSize > slots.length)
				slots.push(null);
		}
	}
	function updateDebugView(slots) {
		var visible = false;
		for (var i=0; i<slots.length; ++i) {
			if (slots[i]) {
				visible = true;
			}
		}
		var txt = 'updates: ' + update + '<br/>\n';
		for (var i=0; i<slots.length; ++i) {
			if (slots[i]) {
				var s = slots[i];
				var o = slots[i].o;
				var n = slots[i].n;
				if(n && typeof n !== 'undefined'){
					txt += '[' + n + "],"
				}
				txt += '[' + i + ']:' + s.g;
				if (o) {
					txt += ':' + (o.Gender ? 'M':'F');
					var so = o.StringOptions;
					for (var j=0; j<so.length; ++j) {
						txt += ':' + so[j].Second;
					}
					if (o.ItemIds) {
						txt += '<br/>';
						for(var k=0; k<o.ItemIds.length; ++k) {
							var id = o.ItemIds[k];
							var re = /Item_(\w+)/;
							var rst = re.exec(id);
							if (rst == null) {
								txt += ':...' + o.ItemIds[k].substr(-20);
							} else {
								txt += ':' + rst[1];
							}
						}
					}
				}
				txt += '<br/>\n';
			}
		}
		var elem = document.getElementById('charDbg');
		if (elem) {
			if (visible) {
				elem.innerHTML = txt;
			} else {
				elem.innerHTML = '';
			}
		}
	}
	// functions for debugging skin in browser }}}

	engine.mock('CreateLobbyCharacter', function (slotIndex, isGenderMale, netId, nickName) {
		if (debugSkin) {
			update++;
			resizeSlot(slotIndex + 1);
			slots[slotIndex] = { n: nickName, g: isGenderMale == true ? 'M' : 'F', o: null };
		}
		console_log('engine received CreateLobbyCharacter:' + slotIndex + ", isGenderMale:" + isGenderMale + ", netId:" + netId + ", nickName:" + nickName);
		updateDebugView(slots);
	});

	engine.mock('UpdateLobbyCharacter', function (slotIndex, options) {
		if (debugSkin) {
			update++;
			slots[slotIndex].o = options;
			console_log('engine received UpdateLobbyCharacter:' + slotIndex, options);
		}
		updateDebugView(slots);
	});

	engine.mock('DestoryLobbyCharacter', function (slotIndex) {
		if (debugSkin) {
			update++;
			slots[slotIndex] = null;
			console_log('engine received DestoryLobbyCharacter:' + slotIndex);
		}
		updateDebugView(slots);
	});

	engine.mock('SetLobbyCamera', function (pos) {
		console_log('engine received SetLobbyCamera:', pos);
	});

	engine.mock('ShowWebPageOnPlatform', function (url) {
		window.open(url, '_blank');
	});

	engine.mock('ShowWebPopup', function (popup) {
		window.open(popup.uri, popup.popupId);
	});

    engine.mock('PlaySound', function() {
        // console_log('PlaySound');
    });

    /* CAMERA TRANSITION */
    engine.mock('CameraTransitionCreateCharacter', function() {
        console_log('CameraTransitionCreateCharacter');
    });

    engine.mock('CameraTransitionHome', function() {
        console_log(`CameraTransitionHome`);
    });

    engine.mock('CameraTransitionPlay', function() {
        console_log(`CameraTransitionPlay`);
    });

    engine.mock('CameraTransitionCustomWardrobe', function() {
        console_log(`CameraTransitionCustomWardrobe`);
    });

    engine.mock('CameraTransitionCustomAppearance', function() {
        console_log(`CameraTransitionCustomAppearance`);
    });

    engine.mock('CameraTransitionRewards', function() {
        console_log(`CameraTransitionRewards`);
    });

    engine.mock('CameraTransitionCareer', function() {
        console_log(`CameraTransitionCareer`);
    });

    engine.mock('CameraTransitionLeaderboard', function() {
        console_log(`CameraTransitionLeaderboard`);
    });

    engine.mock('CameraTransitionWatch', function() {
        console_log(`CameraTransitionWatch`);
    });

    engine.mock('CameraTransitionSettings', function() {
        console_log(`CameraTransitionSettings`);
    });

    engine.mock('CameraTransitionSolo', function() {
        console_log(`CameraTransitionSolo`);
    });

    engine.mock('CameraTransitionDuo', function() {
        console_log(`CameraTransitionDuo`);
    });

    engine.mock('CameraTransitionSquad', function() {
        console_log(`CameraTransitionSquad`);
    });

    engine.mock('SetLobbyCharacterReady', function(slotIndex, isReady) {
        console_log(`SetLobbyCharacterReady`, slotIndex, isReady);
    });

    engine.mock('SetLobbyCharacterHost', function(slotIndex) {
        console_log(`SetLobbyCharacterHost`, slotIndex);
	});

	engine.mock('EnableSystemMenuButton', function() {
		console_log('EnableSystemMenuButton');
	});

	engine.mock('DisableSystemMenuButton', function() {
		console_log('DisableSystemMenuButton');
	});

  var lang = 'en'
  engine.mock('GetCurrentCultureName', function () {
    return lang;
  })

  engine.mock('SetLang', function (l) {
    lang = l;
  })
  	engine.mock('GetOsLanguage', function() {
		  var lang = navigator.language;
		  console_log(`GetOsLanguage`, lang);
		  if (lang) return lang;
		  else return 'ko-KR';
	});

	engine.mock('RequestSystemMenu', function() {
		console_log(`RequestSystemMenu`);
	});

	engine.mock('OpenExternalBrowser', function(url) {
		console_log(`OpenExternalBrowser`, url);
		window.open(url);
	});

	engine.mock('ReadFriendList', function () {
		console_log('engine received ReadFriendList');
		engine.trigger('ReadFriendListResult', 1, null, [
		{
			"userSerial": "76561198031450358",
			"userRealName": "absenty",
			"userDisplayName": "애브센티",
			"presence": {
				"isOnline": true,
				"isPlaying": true,
				"isPlayingThisGame": true,
				"isJoinable": false,
				"status": 0
			}
		},
		{
			"userSerial": "76561198159561631",
			"userRealName": "segv",
			"userDisplayName": "SEGV",
			"presence": {
				"isOnline": true,
				"isPlaying": true,
				"isPlayingThisGame": true,
				"isJoinable": false,
				"status": 0
			}
		},
		{
			"userSerial": "76561197997248906",
			"userRealName": "jajanga",
			"userDisplayName": "jajanga",
			"presence": {
				"isOnline": false,
				"isPlaying": false,
				"isPlayingThisGame": false,
				"isJoinable": false,
				"status": 1
			}
		},
		{
			"userSerial": "76561198033493817",
			"userRealName": "jajanga1",
			"userDisplayName": "jajanga1",
			"presence": {
				"isOnline": false,
				"isPlaying": false,
				"isPlayingThisGame": false,
				"isJoinable": false,
				"status": 1
			}
		},
		{
			"userSerial": "76561198031538317",
			"userRealName": "jajanga2",
			"userDisplayName": "jajanga2",
			"presence": {
				"isOnline": false,
				"isPlaying": false,
				"isPlayingThisGame": false,
				"isJoinable": false,
				"status": 1
			}
		},
		{
			"userSerial": "76561198039366053",
			"userRealName": "jajanga3",
			"userDisplayName": "jajanga3",
			"presence": {
				"isOnline": false,
				"isPlaying": false,
				"isPlayingThisGame": false,
				"isJoinable": false,
				"status": 1
			}
		},
		{
			"userSerial": "76561198096994119",
			"userRealName": "jajanga4",
			"userDisplayName": "jajanga4",
			"presence": {
				"isOnline": false,
				"isPlaying": false,
				"isPlayingThisGame": false,
				"isJoinable": false,
				"status": 1
			}
		},
		{
			"userSerial": "76561198008236749",
			"userRealName": "jajanga5",
			"userDisplayName": "jajanga5",
			"presence": {
				"isOnline": false,
				"isPlaying": false,
				"isPlayingThisGame": false,
				"isJoinable": false,
				"status": 1
			}
		},
		{
			"userSerial": "76561198061663619",
			"userRealName": "jajanga6",
			"userDisplayName": "jajanga6",
			"presence": {
				"isOnline": false,
				"isPlaying": false,
				"isPlayingThisGame": false,
				"isJoinable": false,
				"status": 1
			}
		}
		]);
	});

	engine.mock('RequestReplayList', function(region, index, size) {
		console_log('engine received RequestReplayList');
		engine.trigger('OnReplayList', [
			{
				"friendlyName":"match.bro.official.2017-pre6.na.squad-fpp.2017.12.15.5411165b-4fa5-4014-9d43-6e8e4638995b",
				"name":"match.bro.official.2017-pre6.na.squad-fpp.2017.12.15.5411165b-4fa5-4014-9d43-6e8e4638995b",
				"bIsLive":false,
				"date":"2018.01.04-08.29.23",
				"sizeInBytes":140559651,
				"lengthInMS":1837890,
				"numViewers":0,
				"bIncomplete":false,
				"bIsVersionCompatible":true,
				"bIsCorrupted":false,
				"bIsServerRecording":true,
				"bShouldKeep":false,
				"bArchived":false,
				"mode":"squad-fpp",
				"recordUserId":"UNKNOWN",
				"recordUserNickName":"UNKNOWN",
				"mapName":"Desert_Main",
				"bAllDeadOrWin":true,
				"archiveSizeInBytes":31268733
			},
			{
				"friendlyName":"match.bro.official.2017-pre6.na.squad.2017.12.15.aae3c1ee-a864-410e-a883-ffb05653be91",
				"name":"match.bro.official.2017-pre6.na.squad.2017.12.15.aae3c1ee-a864-410e-a883-ffb05653be91",
				"bIsLive":false,
				"date":"2017.12.25-21.19.28",
				"sizeInBytes":142651221,
				"lengthInMS":1835983,
				"numViewers":0,
				"bIncomplete":false,
				"bIsVersionCompatible":true,
				"bIsCorrupted":false,
				"bIsServerRecording":true,
				"bShouldKeep":false,
				"bArchived":false,
				"mode":"squad",
				"recordUserId":"UNKNOWN",
				"recordUserNickName":"UNKNOWN",
				"mapName":"Desert_Main",
				"bAllDeadOrWin":true,
				"archiveSizeInBytes":31268733
			},
			{
				"friendlyName":"match.bro.official.2017-pre6.as.solo.2017.12.14.c1d1a591-bc79-4b4c-86f4-ba0225974ba8",
				"name":"match.bro.official.2017-pre6.as.solo.2017.12.14.c1d1a591-bc79-4b4c-86f4-ba0225974ba8",
				"bIsLive":false,
				"date":"2017.12.24-03.50.41",
				"sizeInBytes":135155179,
				"lengthInMS":1777381,
				"numViewers":0,
				"bIncomplete":false,
				"bIsVersionCompatible":false,
				"bIsCorrupted":false,
				"bIsServerRecording":true,
				"bShouldKeep":false,
				"bArchived":false,
				"mode":"solo",
				"recordUserId":"UNKNOWN",
				"recordUserNickName":"UNKNOWN",
				"mapName":"Desert_Main",
				"bAllDeadOrWin":true,
				"archiveSizeInBytes":31268733
			},
			{
				"friendlyName":"match.bro.official.2017-pre6.na.duo.2017.12.14.591255e6-b42f-4140-a87f-7400f1b9fad4",
				"name":"match.bro.official.2017-pre6.na.duo.2017.12.14.591255e6-b42f-4140-a87f-7400f1b9fad4",
				"bIsLive":false,
				"date":"2017.12.23-23.16.51",
				"sizeInBytes":84069015,
				"lengthInMS":1590413,
				"numViewers":0,
				"bIncomplete":false,
				"bIsVersionCompatible":true,
				"bIsCorrupted":false,
				"bIsServerRecording":true,
				"bShouldKeep":false,
				"bArchived":false,
				"mode":"duo",
				"recordUserId":"UNKNOWN",
				"recordUserNickName":"UNKNOWN",
				"mapName":"Erangel_Main",
				"bAllDeadOrWin":true,
				"archiveSizeInBytes":31268733
			}
		]);
	});

	engine.mock('RequestReplaySummary', function(region, sessionName) {
		console_log('engine received RequestReplaySummary');
		engine.trigger('OnReplaySummary', {
			"matchId":"match.bro.official.2017-pre6.na.squad-fpp.2017.12.15.5411165b-4fa5-4014-9d43-6e8e4638995b",
			"bIsServerRecording":true,
			"recordUserId":"UNKNOWN",
			"recordUserNickName":"UNKNOWN",
			"mapName":"Desert_Main",
			"weatherName":"Weather_Desert_Clear",
			"regionName":"na",
			"numPlayers":96,
			"numTeams":29,
			"playerStateSummaries":[
				{
					"uniqueId":"76561198004311585",
					"playerName":"pupperr",
					"teamNumber":2,
					"ranking":4,
					"headShots":2,
					"numKills":2,
					"totalGivenDamages":101.39862060546875,
					"longestDistanceKill":26921.205078125,
					"totalMovedDistanceMeter":28648.5625
				},{
					"uniqueId":"76561198049476138",
					"playerName":"Tezz97",
					"teamNumber":4,
					"ranking":17,
					"headShots":1,
					"numKills":0,
					"totalGivenDamages":287.5665588378906,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":17955.349609375
				},{
					"uniqueId":"76561198151568693",
					"playerName":"KojiKondo",
					"teamNumber":9,
					"ranking":8,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":143.3246307373047,
					"longestDistanceKill":3450.166748046875,
					"totalMovedDistanceMeter":27396.5703125
				},{
					"uniqueId":"76561198311858156",
					"playerName":"xXx_DiCKBUTT_xXx",
					"teamNumber":11,
					"ranking":13,
					"headShots":2,
					"numKills":2,
					"totalGivenDamages":340.3948059082031,
					"longestDistanceKill":411.3864440917969,
					"totalMovedDistanceMeter":22962.4375
				},{
					"uniqueId":"76561198151442659",
					"playerName":"zevv",
					"teamNumber":11,
					"ranking":13,
					"headShots":3,
					"numKills":3,
					"totalGivenDamages":535.556640625,
					"longestDistanceKill":5238.80029296875,
					"totalMovedDistanceMeter":23264.3671875
				},{
					"uniqueId":"76561197970453789",
					"playerName":"DeaDBau5",
					"teamNumber":6,
					"ranking":11,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":2.252549886703491,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":24012.94140625
				},{
					"uniqueId":"76561198018732020",
					"playerName":"Dookee",
					"teamNumber":5,
					"ranking":20,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":21209.4140625
				},{
					"uniqueId":"76561198098432338",
					"playerName":"Tr0utMasterJ",
					"teamNumber":5,
					"ranking":20,
					"headShots":1,
					"numKills":2,
					"totalGivenDamages":214.84085083007812,
					"longestDistanceKill":4138.54150390625,
					"totalMovedDistanceMeter":21722.60546875
				},{
					"uniqueId":"76561198054484897",
					"playerName":"ThiccNick",
					"teamNumber":2,
					"ranking":4,
					"headShots":2,
					"numKills":1,
					"totalGivenDamages":99.99999237060547,
					"longestDistanceKill":135.49139404296875,
					"totalMovedDistanceMeter":22766.310546875
				},{
					"uniqueId":"76561198347734114",
					"playerName":"RileyCs",
					"teamNumber":10,
					"ranking":19,
					"headShots":2,
					"numKills":1,
					"totalGivenDamages":100,
					"longestDistanceKill":410.5056457519531,
					"totalMovedDistanceMeter":18558.03125
				},{
					"uniqueId":"76561198133096977",
					"playerName":"Rumple_Foreskin_",
					"teamNumber":11,
					"ranking":13,
					"headShots":2,
					"numKills":0,
					"totalGivenDamages":134.6699981689453,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":23211.34765625
				},{
					"uniqueId":"76561198131175617",
					"playerName":"Vutang",
					"teamNumber":6,
					"ranking":11,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":68.48531341552734,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":21518.6484375
				},{
					"uniqueId":"76561197962518724",
					"playerName":"2pretty_2kill",
					"teamNumber":6,
					"ranking":11,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":119.80000305175781,
					"longestDistanceKill":116.87806701660156,
					"totalMovedDistanceMeter":23736.15625
				},{
					"uniqueId":"76561197964274931",
					"playerName":"Crazyred",
					"teamNumber":13,
					"ranking":1,
					"headShots":1,
					"numKills":3,
					"totalGivenDamages":367.7102966308594,
					"longestDistanceKill":15807.80078125,
					"totalMovedDistanceMeter":28069.97265625
				},{
					"uniqueId":"76561197983609405",
					"playerName":"Birdstheword",
					"teamNumber":4,
					"ranking":9,
					"headShots":2,
					"numKills":0,
					"totalGivenDamages":118.52499389648438,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":23947.654296875
				},{
					"uniqueId":"76561197961933044",
					"playerName":"Bakie",
					"teamNumber":6,
					"ranking":11,
					"headShots":1,
					"numKills":5,
					"totalGivenDamages":558.0479736328125,
					"longestDistanceKill":4874.44677734375,
					"totalMovedDistanceMeter":24168.015625
				},{
					"uniqueId":"76561197990355659",
					"playerName":"GusXD",
					"teamNumber":3,
					"ranking":29,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":14086.3193359375
				},{
					"uniqueId":"76561197977758446",
					"playerName":"Phobia",
					"teamNumber":9,
					"ranking":12,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":105.07247924804688,
					"longestDistanceKill":1468.561279296875,
					"totalMovedDistanceMeter":25519.533203125
				},{
					"uniqueId":"76561198219714413",
					"playerName":"Dymdez",
					"teamNumber":15,
					"ranking":19,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":18530.26171875
				},{
					"uniqueId":"76561198026900792",
					"playerName":"Halfling",
					"teamNumber":1,
					"ranking":29,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":123.70913696289062,
					"longestDistanceKill":80.52429962158203,
					"totalMovedDistanceMeter":17006.62890625
				},{
					"uniqueId":"76561198002257208",
					"playerName":"Tezima",
					"teamNumber":15,
					"ranking":15,
					"headShots":1,
					"numKills":3,
					"totalGivenDamages":298.16448974609375,
					"longestDistanceKill":7494.05615234375,
					"totalMovedDistanceMeter":19174.095703125
				},{
					"uniqueId":"76561198121292204",
					"playerName":"TestPMFB",
					"teamNumber":16,
					"ranking":23,
					"headShots":3,
					"numKills":3,
					"totalGivenDamages":289.24615478515625,
					"longestDistanceKill":703.356689453125,
					"totalMovedDistanceMeter":17438.001953125
				},{
					"uniqueId":"76561198049112001",
					"playerName":"MicroBoy",
					"teamNumber":13,
					"ranking":1,
					"headShots":1,
					"numKills":2,
					"totalGivenDamages":349.37005615234375,
					"longestDistanceKill":396.1410827636719,
					"totalMovedDistanceMeter":34791.640625
				},{
					"uniqueId":"76561198131113586",
					"playerName":"thatveganboy",
					"teamNumber":18,
					"ranking":3,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":21.93379020690918,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":21184.8671875
				},{
					"uniqueId":"76561198076669215",
					"playerName":"leeb0",
					"teamNumber":10,
					"ranking":18,
					"headShots":1,
					"numKills":1,
					"totalGivenDamages":210.1800079345703,
					"longestDistanceKill":350.420654296875,
					"totalMovedDistanceMeter":26031.50390625
				},{
					"uniqueId":"76561198043360475",
					"playerName":"graspmybartwurst",
					"teamNumber":16,
					"ranking":23,
					"headShots":3,
					"numKills":0,
					"totalGivenDamages":8.972978591918945,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":17476.19140625
				},{
					"uniqueId":"76561198047315218",
					"playerName":"Sleurlee",
					"teamNumber":12,
					"ranking":10,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":113.2300033569336,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":22439.986328125
				},{
					"uniqueId":"76561197989367891",
					"playerName":"Calomeni",
					"teamNumber":8,
					"ranking":5,
					"headShots":2,
					"numKills":2,
					"totalGivenDamages":275.9329833984375,
					"longestDistanceKill":13192.736328125,
					"totalMovedDistanceMeter":24461.69140625
				},{
					"uniqueId":"76561197991963661",
					"playerName":"Jubsies",
					"teamNumber":20,
					"ranking":21,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":35,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":17989.109375
				},{
					"uniqueId":"76561198144244734",
					"playerName":"Motnel",
					"teamNumber":14,
					"ranking":16,
					"headShots":1,
					"numKills":1,
					"totalGivenDamages":148.2089385986328,
					"longestDistanceKill":5416.99658203125,
					"totalMovedDistanceMeter":20901.771484375
				},{
					"uniqueId":"76561197991438787",
					"playerName":"OgEzus",
					"teamNumber":17,
					"ranking":25,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":50.81999969482422,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":18344.0390625
				},{
					"uniqueId":"76561197988098708",
					"playerName":"buk-kake-whore",
					"teamNumber":17,
					"ranking":25,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":18288.19140625
				},{
					"uniqueId":"76561198393486904",
					"playerName":"steen013",
					"teamNumber":1,
					"ranking":29,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":24351.01953125
				},{
					"uniqueId":"76561198066839914",
					"playerName":"yerm",
					"teamNumber":18,
					"ranking":3,
					"headShots":2,
					"numKills":1,
					"totalGivenDamages":362.4772644042969,
					"longestDistanceKill":341.1280822753906,
					"totalMovedDistanceMeter":24071.404296875
				},{
					"uniqueId":"76561198142433219",
					"playerName":"zOctanEz",
					"teamNumber":16,
					"ranking":23,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":17529.015625
				},{
					"uniqueId":"76561197978360796",
					"playerName":"Kubla",
					"teamNumber":17,
					"ranking":25,
					"headShots":2,
					"numKills":2,
					"totalGivenDamages":267.6199951171875,
					"longestDistanceKill":848.3095092773438,
					"totalMovedDistanceMeter":18336.625
				},{
					"uniqueId":"76561198011612026",
					"playerName":"Jasperuu",
					"teamNumber":20,
					"ranking":25,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":18327.359375
				},{
					"uniqueId":"76561198092847827",
					"playerName":"YaBoiEtDatPus445",
					"teamNumber":21,
					"ranking":7,
					"headShots":1,
					"numKills":1,
					"totalGivenDamages":139.03018188476562,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":26431.76171875
				},{
					"uniqueId":"76561198009550721",
					"playerName":"SHAMBAMPOW",
					"teamNumber":9,
					"ranking":8,
					"headShots":0,
					"numKills":2,
					"totalGivenDamages":266.63812255859375,
					"longestDistanceKill":5862.55419921875,
					"totalMovedDistanceMeter":26608.890625
				},{
					"uniqueId":"76561198396062747",
					"playerName":"NotGil",
					"teamNumber":1,
					"ranking":29,
					"headShots":2,
					"numKills":2,
					"totalGivenDamages":127.89086151123047,
					"longestDistanceKill":1316.299072265625,
					"totalMovedDistanceMeter":17282.58203125
				},{
					"uniqueId":"76561198025279607",
					"playerName":"TrillHypeFamJam",
					"teamNumber":20,
					"ranking":21,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":32.48291015625,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":19121.21875
				},{
					"uniqueId":"76561197996206929",
					"playerName":"Christs_Love",
					"teamNumber":22,
					"ranking":22,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":21553.1328125
				},{
					"uniqueId":"76561198051446068",
					"playerName":"PhantomOfEden",
					"teamNumber":18,
					"ranking":3,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":147.97097778320312,
					"longestDistanceKill":508.8654479980469,
					"totalMovedDistanceMeter":22917.87890625
				},{
					"uniqueId":"76561198153677376",
					"playerName":"DentedWand",
					"teamNumber":10,
					"ranking":18,
					"headShots":3,
					"numKills":1,
					"totalGivenDamages":140.13999938964844,
					"longestDistanceKill":858.6952514648438,
					"totalMovedDistanceMeter":20389.2578125
				},{
					"uniqueId":"76561198254092523",
					"playerName":"MELVlN",
					"teamNumber":26,
					"ranking":29,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":15784.4365234375
				},{
					"uniqueId":"76561198045290637",
					"playerName":"Belvin",
					"teamNumber":26,
					"ranking":29,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":14880.68359375
				},{
					"uniqueId":"76561198066372710",
					"playerName":"SadRainbow",
					"teamNumber":21,
					"ranking":7,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":162.60855102539062,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":24178.53515625
				},{
					"uniqueId":"76561197970072984",
					"playerName":"GruntMercenary",
					"teamNumber":26,
					"ranking":29,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":15151.189453125
				},{
					"uniqueId":"76561198304034782",
					"playerName":"lHoltzman7",
					"teamNumber":10,
					"ranking":19,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":79.86000061035156,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":18685.791015625
				},{
					"uniqueId":"76561197960822490",
					"playerName":"m8yh8m",
					"teamNumber":22,
					"ranking":22,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":119,
					"longestDistanceKill":466.4131164550781,
					"totalMovedDistanceMeter":21379.30078125
				},{"uniqueId":"76561198010018355",
					"playerName":"ErikTheViking",
					"teamNumber":7,
					"ranking":19,
					"headShots":1,
					"numKills":5,
					"totalGivenDamages":501.29168701171875,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":26639.08984375
				},{"uniqueId":"76561198046436145",
					"playerName":"no-homo-no-shoot",
					"teamNumber":4,
					"ranking":17,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":18338.2109375
				},{"uniqueId":"76561198050551462",
					"playerName":"KongoMongo",
					"teamNumber":25,
					"ranking":6,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":26.06255531311035,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":29537.5390625
				},{"uniqueId":"76561198094626159",
					"playerName":"SynTurtle",
					"teamNumber":24,
					"ranking":14,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":24230.13671875
				},{"uniqueId":"76561198012454654",
					"playerName":"joeveryold",
					"teamNumber":24,
					"ranking":14,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":20049.53515625
				},{"uniqueId":"76561197989901233",
					"playerName":"Mrs_Nesbitt",
					"teamNumber":27,
					"ranking":26,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":19769.26171875
				},{"uniqueId":"76561198145674060",
					"playerName":"infamousrage",
					"teamNumber":24,
					"ranking":14,
					"headShots":1,
					"numKills":2,
					"totalGivenDamages":298.34808349609375,
					"longestDistanceKill":753.3493041992188,
					"totalMovedDistanceMeter":24338.314453125
				},{"uniqueId":"76561197989865867",
					"playerName":"bongrip",
					"teamNumber":27,
					"ranking":26,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":19617.25
				},{"uniqueId":"76561198326428437",
					"playerName":"Peebow",
					"teamNumber":25,
					"ranking":6,
					"headShots":1,
					"numKills":1,
					"totalGivenDamages":77.13067626953125,
					"longestDistanceKill":9516.1953125,
					"totalMovedDistanceMeter":29663.4609375
				},{"uniqueId":"76561198436785349",
					"playerName":"Norzy",
					"teamNumber":23,
					"ranking":27,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":16799.953125
				},{"uniqueId":"76561198035818068",
					"playerName":"EwokLIVE",
					"teamNumber":30,
					"ranking":12,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":16793.66796875
				},{"uniqueId":"76561198441872184",
					"playerName":"Erektus",
					"teamNumber":25,
					"ranking":6,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":123.76000213623047,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":20494.6484375
				},{"uniqueId":"76561198018691800",
					"playerName":"JellyScissor",
					"teamNumber":27,
					"ranking":26,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":83.32933044433594,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":20217.4921875
				},{"uniqueId":"76561198062599235",
					"playerName":"Dapurplekat",
					"teamNumber":30,
					"ranking":12,
					"headShots":1,
					"numKills":3,
					"totalGivenDamages":249,
					"longestDistanceKill":4921.9482421875,
					"totalMovedDistanceMeter":26161.076171875
				},{"uniqueId":"76561197984646788",
					"playerName":"Smokin-Joe",
					"teamNumber":9,
					"ranking":8,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":244.30123901367188,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":27337.33984375
				},{"uniqueId":"76561197989832390",
					"playerName":"Skippidyboop",
					"teamNumber":23,
					"ranking":27,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":100,
					"longestDistanceKill":229.75942993164062,
					"totalMovedDistanceMeter":17185.826171875
				},{"uniqueId":"76561198399960311",
					"playerName":"Nordy003",
					"teamNumber":31,
					"ranking":2,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":21401.603515625
				},{"uniqueId":"76561198392779248",
					"playerName":"SirZachAttack01",
					"teamNumber":31,
					"ranking":2,
					"headShots":5,
					"numKills":7,
					"totalGivenDamages":473.9432373046875,
					"longestDistanceKill":10106.201171875,
					"totalMovedDistanceMeter":25203.4453125
				},{"uniqueId":"76561198092436891",
					"playerName":"MingRee",
					"teamNumber":30,
					"ranking":12,
					"headShots":1,
					"numKills":3,
					"totalGivenDamages":416.1444091796875,
					"longestDistanceKill":3144.5283203125,
					"totalMovedDistanceMeter":24101.69140625
				},{"uniqueId":"76561198337730133",
					"playerName":"cnc_trigger",
					"teamNumber":5,
					"ranking":20,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":41.399147033691406,
					"longestDistanceKill":2677.728759765625,
					"totalMovedDistanceMeter":21681.748046875
				},{"uniqueId":"76561198046058739",
					"playerName":"Jerr310",
					"teamNumber":12,
					"ranking":10,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":21948.03125
				},{"uniqueId":"76561198037751795",
					"playerName":"Tezz98",
					"teamNumber":4,
					"ranking":17,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":45.39043426513672,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":16309.33984375
				},{"uniqueId":"76561197966881363",
					"playerName":"dodomart",
					"teamNumber":8,
					"ranking":5,
					"headShots":6,
					"numKills":3,
					"totalGivenDamages":502.7724304199219,
					"longestDistanceKill":2043.627197265625,
					"totalMovedDistanceMeter":24150.90625
				},{"uniqueId":"76561197972451205",
					"playerName":"Captkevin510",
					"teamNumber":28,
					"ranking":24,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":131.34999084472656,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":17462.7734375
				},{"uniqueId":"76561198063914283",
					"playerName":"Pizwah",
					"teamNumber":13,
					"ranking":1,
					"headShots":4,
					"numKills":7,
					"totalGivenDamages":671.891357421875,
					"longestDistanceKill":17040.544921875,
					"totalMovedDistanceMeter":28174.505859375
				},{"uniqueId":"76561198002564190",
					"playerName":"neat",
					"teamNumber":15,
					"ranking":15,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":155.5462646484375,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":19313.0859375
				},{"uniqueId":"76561198053374350",
					"playerName":"Pwnbot",
					"teamNumber":24,
					"ranking":14,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":77.00446319580078,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":24223.244140625
				},{"uniqueId":"76561198045959051",
					"playerName":"bigtesteserver",
					"teamNumber":27,
					"ranking":27,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":16.67066764831543,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":20092.0625
				},{"uniqueId":"76561198079437420",
					"playerName":"Canceled-Fish",
					"teamNumber":14,
					"ranking":16,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":101.50605773925781,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":21189.546875
				},{"uniqueId":"76561198385238444",
					"playerName":"dEvilHash420",
					"teamNumber":30,
					"ranking":12,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":17450.50390625
				},{"uniqueId":"76561198008783481",
					"playerName":"Bicyclops",
					"teamNumber":20,
					"ranking":21,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":61.599998474121094,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":19294.099609375
				},{"uniqueId":"76561198316065073",
					"playerName":"SplashaDasha",
					"teamNumber":23,
					"ranking":27,
					"headShots":3,
					"numKills":2,
					"totalGivenDamages":300,
					"longestDistanceKill":1353.072509765625,
					"totalMovedDistanceMeter":17019.33984375
				},{"uniqueId":"76561198187439561",
					"playerName":"IdontKnoYet",
					"teamNumber":28,
					"ranking":24,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":16812.154296875
				},{"uniqueId":"76561198296058306",
					"playerName":"ColeDanny",
					"teamNumber":31,
					"ranking":2,
					"headShots":8,
					"numKills":3,
					"totalGivenDamages":717.3173828125,
					"longestDistanceKill":2457.397216796875,
					"totalMovedDistanceMeter":25541.005859375
				},{"uniqueId":"76561198208791569",
					"playerName":"DuckThief",
					"teamNumber":21,
					"ranking":7,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":22596.64453125
				},{"uniqueId":"76561198085833786",
					"playerName":"fonuc",
					"teamNumber":25,
					"ranking":6,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":28786.888671875
				},{"uniqueId":"76561198059224398",
					"playerName":"KyoserAx",
					"teamNumber":3,
					"ranking":29,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":13475.9951171875
				},{"uniqueId":"76561198069174737",
					"playerName":"CobbRossCornNail",
					"teamNumber":14,
					"ranking":16,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":21221.830078125
				},{"uniqueId":"76561198012665323",
					"playerName":"froglegs",
					"teamNumber":2,
					"ranking":4,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":100.00000762939453,
					"longestDistanceKill":390.3717956542969,
					"totalMovedDistanceMeter":22865.24609375
				},{"uniqueId":"76561198027016818",
					"playerName":"nicetryy",
					"teamNumber":3,
					"ranking":29,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":15468.173828125
				},{"uniqueId":"76561198066235376",
					"playerName":"GaryLazor-Eyes",
					"teamNumber":12,
					"ranking":10,
					"headShots":1,
					"numKills":1,
					"totalGivenDamages":397.2516174316406,
					"longestDistanceKill":484.5870361328125,
					"totalMovedDistanceMeter":25720.05078125
				},{"uniqueId":"76561198089694396",
					"playerName":"Dee_Le",
					"teamNumber":28,
					"ranking":24,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":100,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":17343.142578125
				},{"uniqueId":"76561198054210296",
					"playerName":"69fergiefan69",
					"teamNumber":2,
					"ranking":4,
					"headShots":1,
					"numKills":1,
					"totalGivenDamages":121.45880889892578,
					"longestDistanceKill":1406.1790771484375,
					"totalMovedDistanceMeter":28262.296875
				},{
					"uniqueId":"76561198198185719",
					"playerName":"MyNinjitsu",
					"teamNumber":12,
					"ranking":10,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":20726.94921875
				},{
					"uniqueId":"76561197970426505",
					"playerName":"Sea_Turtle",
					"teamNumber":22,
					"ranking":22,
					"headShots":0,
					"numKills":1,
					"totalGivenDamages":142.75,
					"longestDistanceKill":102.34647369384766,
					"totalMovedDistanceMeter":21444.9375
				},{
					"uniqueId":"76561198125190782",
					"playerName":"Viico",
					"teamNumber":14,
					"ranking":16,
					"headShots":0,
					"numKills":0,
					"totalGivenDamages":0,
					"longestDistanceKill":0,
					"totalMovedDistanceMeter":20597.2109375
				}
			]}
		);
	});


//engine.mock('GetCustomizableObjectIdForItem', function (slotIndex, itemId) {
//    console_log('engine received GetCustomizableObjectIdForItem:' + slotIndex + ", itemId:" + itemId);

//    return {
//        CustomizableObjectKey: "Torso",
//        CustomizableObjectValue: "F_Body_C_01"
//    };
//});
})();
