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
				var li = $('<li>');
				li.attr('data-cell', 10*i+j);
				li.hover(layoutShip, clearLayout);
				ul.append(li);
			};
			field.append(ul);
		}
	}

	function layoutShip() {
		var hoverCell = parseInt($(this).attr('data-cell'));
		var orientation = 0; // 0 = vert, 1 = horiz
		var length = 4;
		var x = Math.floor(hoverCell/10);
		var y = hoverCell % 10;
		var toHighlight = [];
		if (orientation === 0) {
			x = x <= 10 - length ? x : 10 - length;
		} else {
			y = y <= 10 - length ? y : 10 - length;
		}
		for (var i = 0; i < length; i++) {
			var cell = $('[data-cell=' + (10*x+y) + ']');
			cell.addClass('drop_help');
			orientation === 0 ? x++ : y++;
		}
		
	}

	function clearLayout() {
		$('#field li').removeClass('drop_help');
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