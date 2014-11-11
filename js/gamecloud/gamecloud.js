/**
 * Created by Janne on 10.11.2014.
 */

//
// 13.02.2014 Timo Hynninen
//
// Gamecloud interfacing library
// (http request simplifier)
//
//
// Much code such simple wow
//

//var SERVER_ADDRESS = "https://54.220.223.184:8843";
var SERVER_ADDRESS = Config.gamecloudAddress;



function httpGet(theUrl) {
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // method, url, bool async
    xmlHttp.send( null );
    return xmlHttp.responseText;
}





function gainItem (authkey, hash, playerId, characterId) {

    json = { "callType" : "gameDataSave",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId }


    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return true;

    });

}

function looseItem (authkey, hash, playerId, characterId) {

    json = { "callType" : "gameDataSave",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId }

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return true;

    });

}

function hasItem (authkey, hash, playerId, characterId) {

    json = { "callType" : "ask",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId }

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return data;

    });

}
function giveAchievement (authkey, hash, playerId, characterId) {

    json = { "callType" : "gameDataSave",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId }

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return true;

    });

}

function hasAchievement (authkey, hash, playerId, characterId) {

    json = { "callType" : "ask",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId }

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return data;

    });

}

function triggersEvent (authkey, hash, playerId, characterId) {

    json = { "callType" : "gameDataSave",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId }

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return data;

    });

}

function hasTriggeredEvent (authkey, hash, playerId, characterId) {

    json = { "callType" : "ask",
        "authkey" : authkey,
        "hash" : hash,
        "playerId" : playerId,
        "characterId" : characterId }

    $.post(SERVER_ADDRESS, JSON.stringify(json), function(data, textStatus, jqXHR){
        if (!data ) return false;
        else return data;

    });

}