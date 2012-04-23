var debug = true;
var log = function() {
	if (typeof console !== "undefined" && console.log && debug) {console.log(arguments)};
}

var battlenode = battlenode || {};

(function() {

	// vars

	var socket;
	var playerCount = 0;

	// private

	function initSocket() {
		battlenode.socket = io.connect();
		socket = battlenode.socket;

		socket.on('player_connected', function(data) {
			log('player connected', JSON.stringify(data));
			playerCount++;
			$('.message').text(playerCount + " players connected");
			$('.player_list').append($('<li id=\'player' + data.id + '\'></li>').text(data.name));
		});
		socket.on('player_disconnected', function(data) {
			log('player disconnected', JSON.stringify(data));
			playerCount--;
			$('.message').text(playerCount + " players connected");
			// TODO delete appropriate player	
			$('#player' + data.id).remove();
		});
		socket.on('player_list', function(data) {
			log('player list', JSON.stringify(data));
			var list = data.list;
			for (var i = 0; i < list.length; i++) {
				var player = list[i];
				var playerEl = $('<li id=\'player' + player.id + '\'></li>').text(player.name);
				if (player.status === "ready") {
					playerEl.addClass('ready');
				}
				$('.player_list').append(playerEl);
			};
			playerCount += list.length;
			$('.message').text(playerCount + " players connected");
		});
		socket.on('status_change', function(data) {
			$('#player' + data.id).addClass(data.status);
		});
	}

	function setReady() {
		socket.emit('ready');
		$('#ready_btn').attr('disabled', 'disabled');
	}

	function buildField() {
		var field = $('#field');
		for (var i = 0; i < 10; i++) {
			var ul = $('<ul>');
			for (var j = 0; j < 10; j++) {
				var li = $('<li>').addClass('cell' + (10 * i + j));
				ul.append(li);
			};
			field.append(ul);
		}
	}

	// public

	battlenode.getName = function() {
		var name = $('#display_name').val().trim();
		if (name !== "") {
			$('#get_name').modal('hide');
			socket.emit('player_connected', {name: name});
		}
		return false;
	};

	battlenode.init = function() {
		$('#get_name').modal({keyboard: false, backdrop: "static"});
		$('#display_name').focus();
		$('#ready_btn').click(setReady);

		buildField();

		initSocket();
	};
})();

$(document).ready(function() {
	battlenode.init();
});