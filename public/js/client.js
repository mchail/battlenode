var battlenode = battlenode || {};

(function() {

	// vars

	var socket;

	// private

	function initSocket() {
		battlenode.socket = io.connect();
		socket = battlenode.socket;

		socket.on('player_connected', function(data) {
			console.log(data);
			$('.message').text(data.count + " players connected");
		});
	}

	// public

		

	battlenode.getName = function() {
		var name = $('#display_name').val().trim();
		if (name !== "") {
			$('#get_name').modal('hide');
			socket.emit('player_connected', {name: name});
		}
	};

	battlenode.init = function() {
		$('#get_name').modal({keyboard: false, backdrop: "static"});
		$('#display_name').focus();

		initSocket();
	};
})();

$(document).ready(function() {
	battlenode.init();
});