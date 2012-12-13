(function( $ ){
	/**
	 * Command line prompt plugin. Emulates simple linux style command line prompt
	 */
	$.fn.jqvi = function( custom ) {

		// Customizable things.
		var settings = $.extend({
			fileText : '',
			filename : '',
			unloadCallback : function() {},
			filesystem : {},
		}, custom);

		var key = {
			backspace : 8,
			colon : 58,
			delete : 46,
			enter : 13,
			escape : 27,
			left_arrow : 37,
			right_arrow : 39,
			tab : 9,
			up_arrow : 38,
			down_arrow : 40,
			carat : 94,
		}
		$this = $(this);
		vi = {
			command : false,
			file : '',
			newFile : false,
			pointerLocation : 0,
			filename : '',
			fileMemory : new Array(),
			load : function() {
				$this.html("<div id='viWindow'></div><ul id='bottomBar'><li id='viInput'></li><li id='linenum'>4,11</li><li>All</li></ul>");
				var docHeight = $(window).height();
				if(settings.fileText == '')
				{
					vi.original = "<p></p>";

					$("#viWindow").prepend("<p id='current_line'><span class='input'><span class='before'></span><span class='selected'></span><span class='after'></span></span></p>");
					vi.newFile = true;
				}
				else
				{
					$("#viWindow").prepend(settings.fileText.replace(/\\('|")/gi, "$1"));
					vi.original = $("#viWindow").html();
					$("#viWindow p:first-child").attr("id", "current_line");
					vi.contentPresent();
				}
				if(vi.newFile)
				{
					var fileOpenTxt = '"'+settings.filename+'" [New File]';
				}
				else
				{
					var lines = $("#viWindow p").length;
					var characters = $("#viWindow").text().length + lines;
					var fileOpenTxt = '"'+settings.filename+'" '+lines+'L, '+characters+'C';
				}
				$("#viInput").html(fileOpenTxt);
				var x = 0;
				while(x < 100)
				{
					$("#viWindow").append("<p class='empty'>~</p>");
					x++;
				}
				vi.pointerDisplay();
				vi.fileMemory.push($("#viWindow").html());
				$this.on("keydown.viKeyDown", vi.cmdKeyDown);
				$this.on("keypress.viKeyPress", vi.cmdKeyPress);
				$this.focus();
			},
			unload : function() {
				vi.fileMemory = new Array();
				vi.command = false;
				$("#viWindow").remove();
				$("#bottomBar").remove();
				$this.off("keydown.viKeyDown");
				$this.off("keypress.viKeyPress");
				settings.unloadCallback();
			},
			pointerDisplay : function()
			{
				var line = $("#current_line").index()+1;
				var cursor = vi.pointerLocation+1;
				$("#linenum").html(line+","+cursor);
			},
			redrawLine : function()
			{
				var text = $("#current_line").text();

				var prvTxt = text.slice(0, vi.pointerLocation);
				var curTxt = text.slice(vi.pointerLocation, vi.pointerLocation+1);
				var aftrTxt = text.slice(vi.pointerLocation+1);
				$("#current_line").html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');
			},
			navigation : function(e)
			{
				$pointer = $(pointer);
				if(e.which == key.left_arrow) 
				{
					if($pointer.parent().children(".before").html() != '')
					{
						if($pointer.parent().children('.after').text().length == 0 && $pointer.html() != '')
						{	
							vi.pointerLocation--;
						}
						else 
						{
							vi.pointerLocation = $pointer.parent().children('.before').text().length-1;
						}
					}
					else
					{
						vi.pointerLocation = 0;
					}
				}
				else if(e.which == key.right_arrow) 
				{
					if($pointer.parent().children(".after").html() != '')
					{
						vi.pointerLocation++;
					}
					else if($pointer.html() != '')
					{
						vi.pointerLocation++;
					}
				}
				else if(e.which == key.up_arrow)
				{
					$prevLine = $pointer.parent().parent().prev();
					if($pointer.parent().parent().prev().html() != null)
					{
						var prvTxt = $prevLine.text().slice(0, vi.pointerLocation);
						var curTxt = $prevLine.text().slice(vi.pointerLocation, vi.pointerLocation+1);
						var aftrTxt = $prevLine.text().slice(vi.pointerLocation+1);
						$prevLine.html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');
						$("#current_line").html($("#current_line").text()).removeAttr("id").prev().attr("id", "current_line");						
					}
				}
				else if(e.which == key.down_arrow)
				{
					if(!$("#current_line").next().hasClass("empty"))
					{
						$nextLine = $pointer.parent().parent().next()
						var prvTxt = $nextLine.text().slice(0, vi.pointerLocation);
						var curTxt = $nextLine.text().slice(vi.pointerLocation, vi.pointerLocation+1);
						var aftrTxt = $nextLine.text().slice(vi.pointerLocation+1);
						$nextLine.html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');
						$("#current_line").html($("#current_line").text()).removeAttr("id").next().attr("id", "current_line");
					}
				}
			},
			cmdKeyDown : function(e)
			{
				if(!vi.command)
				{
					$pointer = $(pointer);
					var inTheMiddle = ($pointer.prev().children(".before").length > 0) ? true : false;
					vi.navigation(e);	
					navigation(e);
				}
				else
				{
					$pointer = $(pointer);
					inputText = $pointer.parent().text();
					navigation(e, true, function() {
						if(e.which == key.backspace && inputText == '')
						{
							$("#viInput").html('');
							vi.command = false;
							if($("#current_line").text() != '')
							{
								vi.contentPresent();
							}
							else
							{
								$("#viPointer").show();
								if($("#viPointer").prev().children(".pointerHolder").length > 0)
								{
									$("#viPointer").prev().children(".pointerHolder").remove();							}

							}
						}
					});		
				}
				vi.pointerDisplay();
			},
			cmdKeyPress : function(e)
			{
				var keycode = null;
				if(window.event) {
					keycode = window.event.keyCode;
				}else if(e) {
					keycode = e.which;
				}
				var keyTxt = String.fromCharCode(keycode);
				if(!vi.command)
				{
					if(keyTxt == "a")
					{
						$("#viInput").removeClass("inputError").html("-- INSERT --");
						var input = $pointer.parent().children(".after").text();
						var slicedString = input.slice(1);
						var firstLetter = input.slice(0, 1);
						$pointer.parent().children(".before").text($pointer.parent().children(".before").text()+$pointer.parent().children(".selected").text());
						$pointer.parent().children(".selected").text(firstLetter);
						$pointer.parent().children(".after").text(slicedString);
						if($pointer.parent().children(".after").html() != '')
						{
							vi.pointerLocation++;
						}
						else if($pointer.html() != '')
						{
							vi.pointerLocation++;
						}


						$this.off("keypress.viKeyPress");
						$this.off("keydown.viKeyDown");
						$this.on("keypress.viInsertKeyPress", vi.insertKeyPress);
						$this.on("keydown.viInsertKeyDown", vi.insertKeyDown);
					}
					else if(keyTxt == "J")
					{
						vi.pointerLocation = $("#current_line").text().length;
						$("#current_line").text($("#current_line").text() + " " + $("#current_line").next().text());
							$("#current_line").next().remove();
						vi.redrawLine();
					}
					else if(keyTxt == "d" || keyTxt == "Z")
					{
						$this.off("keypress.viKeyPress");
						$this.off("keydown.viKeyDown");
						vi.optionListener(keyTxt);
					}
					else if(keyTxt == "i")
					{
						$("#viInput").removeClass("inputError").html("-- INSERT --");

						$this.off("keypress.viKeyPress");
						$this.off("keydown.viKeyDown");
						$this.on("keypress.viInsertKeyPress", vi.insertKeyPress);
						$this.on("keydown.viInsertKeyDown", vi.insertKeyDown);
					}
					else if(keyTxt == "I")
					{
						vi.pointerLocation =0;
						$("#viInput").removeClass("inputError").html("-- INSERT --");
						vi.redrawLine();
						$this.off("keypress.viKeyPress");
						$this.off("keydown.viKeyDown");
						$this.on("keypress.viInsertKeyPress", vi.insertKeyPress);
						$this.on("keydown.viInsertKeyDown", vi.insertKeyDown);
					}
					else if(keyTxt == "A")
					{
						vi.pointerLocation = $(pointer).parent().text().length;
						$("#viInput").removeClass("inputError").html("-- INSERT --");
						vi.redrawLine();
						$this.off("keypress.viKeyPress");
						$this.off("keydown.viKeyDown");
						$this.on("keypress.viInsertKeyPress", vi.insertKeyPress);
						$this.on("keydown.viInsertKeyDown", vi.insertKeyDown);
					}
					else if(keyTxt == "o")
					{
						$(pointer).parent().parent().html($(pointer).parent().parent().text()).after("<p id='current_line'><span class='input'><span class='before'></span><span class='selected'></span><span class='after'></span></span></p>");
						$("#viInput").removeClass("inputError").html("-- INSERT --");

						$this.off("keypress.viKeyPress");
						$this.off("keydown.viKeyDown");
						$this.on("keypress.viInsertKeyPress", vi.insertKeyPress);
						$this.on("keydown.viInsertKeyDown", vi.insertKeyDown);
					}
					else if(keyTxt == "O")
					{
						$(pointer).parent().parent().html($(pointer).parent().parent().text()).before("<p id='current_line'><span class='input'><span class='before'></span><span class='selected'></span><span class='after'></span></span></p>");
						$("#viInput").removeClass("inputError").html("-- INSERT --");

						$this.off("keypress.viKeyPress");
						$this.off("keydown.viKeyDown");
						$this.on("keypress.viInsertKeyPress", vi.insertKeyPress);
						$this.on("keydown.viInsertKeyDown", vi.insertKeyDown);
					}
					else if(keycode == key.colon) //colon
					{
						$("#current_line .input").html($("#current_line .input").text());
						$("#viInput").removeClass("inputError").html("<span>:</span><span class='input'><span class='before'></span><span class='selected'></span><span class='after'></span>");
						$("#viPointer").hide();
						if($("#viPointer").prev().text() == '')
						{
							$("#viPointer").prev().html("<span class='pointerHolder'> </span>")
						}
						vi.command = true;
					}
					else if(keycode == key.carat)
					{
						var input = $pointer.parent().children(".before").text();
						for(x = vi.pointerLocation-1; x > 0; x--)
						{
							if(input[x] == ' ')
							{
								vi.pointerLocation--;
							}
							else
							{
								break;
							}
						}
						vi.redrawLine();
					}
					else if(keyTxt == "h") //left a character
					{
						var input = $pointer.parent().children(".before").text();
						if(input.length > 0)
						{
							var slicedString = input.slice(0, -1);
							var lastLetter = input.slice(-1);
							$pointer.parent().children(".after").text($pointer.parent().children(".selected").text()+$pointer.parent().children(".after").text());
							$pointer.parent().children(".selected").text(lastLetter);
							$pointer.parent().children(".before").text(slicedString);						
						}
						if($pointer.parent().children(".before").html() != '')
						{
							if($pointer.parent().children('.after').text().length == 0 && $pointer.html() != '')
							{	
								vi.pointerLocation--;
							}
							else 
							{
								vi.pointerLocation = $pointer.parent().children('.before').text().length-1;
							}
						}
						else
						{
							vi.pointerLocation = 0;
						}
					}
					else if(keyTxt == "l") //right a character
					{
						var input = $pointer.parent().children(".after").text();
						var slicedString = input.slice(1);
						var firstLetter = input.slice(0, 1);
						$pointer.parent().children(".before").text($pointer.parent().children(".before").text()+$pointer.parent().children(".selected").text());
						$pointer.parent().children(".selected").text(firstLetter);
						$pointer.parent().children(".after").text(slicedString);
						if($pointer.parent().children(".after").html() != '')
						{
							vi.pointerLocation++;
						}
						else if($pointer.html() != '')
						{
							vi.pointerLocation++;
						}
					}
					else if(keyTxt == "x")
					{
						var input = $pointer.parent().children(".after").text();
						var slicedString = input.slice(1);
						var firstLetter = input.slice(0, 1);
						$pointer.parent().children(".selected").text(firstLetter);
						$pointer.parent().children(".after").text(slicedString);
					}
					else if(keyTxt == "k") //up a line
					{
						$prevLine = $pointer.parent().parent().prev();
						if($pointer.parent().parent().prev().html() != null)
						{
							var prvTxt = $prevLine.text().slice(0, vi.pointerLocation);
							var curTxt = $prevLine.text().slice(vi.pointerLocation, vi.pointerLocation+1);
							var aftrTxt = $prevLine.text().slice(vi.pointerLocation+1);
							$prevLine.html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');
							$("#current_line").html($("#current_line").text()).removeAttr("id").prev().attr("id", "current_line");						
						}
					}
					else if(keyTxt == "j") //down a line
					{
						if(!$("#current_line").next().hasClass("empty"))
						{
							$nextLine = $pointer.parent().parent().next()
							var prvTxt = $nextLine.text().slice(0, vi.pointerLocation);
							var curTxt = $nextLine.text().slice(vi.pointerLocation, vi.pointerLocation+1);
							var aftrTxt = $nextLine.text().slice(vi.pointerLocation+1);
							$nextLine.html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');
							$("#current_line").html($("#current_line").text()).removeAttr("id").next().attr("id", "current_line");
						}
					}
					else if(keyTxt == "0") // beginning of the line
					{
						vi.pointerLocation = 0;
						$curLine = $pointer.parent().parent();
						var prvTxt = $curLine.text().slice(0, vi.pointerLocation);
						var curTxt = $curLine.text().slice(vi.pointerLocation, vi.pointerLocation+1);
						var aftrTxt = $curLine.text().slice(vi.pointerLocation+1);
						$curLine.html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');
					}
					else if(keyTxt == "$") //end of the line
					{
						vi.pointerLocation = $pointer.parent().text().length - 1;
						$curLine = $pointer.parent().parent();
						var prvTxt = $curLine.text().slice(0, vi.pointerLocation);
						var curTxt = $curLine.text().slice(vi.pointerLocation, vi.pointerLocation+1);
						var aftrTxt = $curLine.text().slice(vi.pointerLocation+1);
						$curLine.html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');
					}
					else if(keyTxt == "u")
					{
						$("#viWindow").html(vi.fileMemory.pop());
					}
					else if(keyTxt == "w") //beginning of the next word
					{
						if(!$("#current_line").next().hasClass("empty") || $("#current_line").find(".after").html() != '')
						{
							var location = $pointer.next().text().indexOf(' ');
							vi.pointerLocation += location;
							$line = $pointer.parent().parent();
							if(location >= 0)
							{
								vi.pointerLocation += 2;
							}
							else if(vi.pointerLocation != $("#current_line").text().length-2)
							{
								vi.pointerLocation = $("#current_line").text().length-1;
							}
							else
							{
								vi.pointerLocation = 0;
								$line = $pointer.parent().parent().next();
								$("#current_line").html($("#current_line").text()).removeAttr("id").next().attr("id", "current_line");
							}
							var prvTxt  = $line.text().slice(0, vi.pointerLocation);
							var curTxt  = $line.text().slice(vi.pointerLocation, vi.pointerLocation+1);
							var aftrTxt = $line.text().slice(vi.pointerLocation+1);
							$line.html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');							

						}
					}
					else if(keyTxt == "b" && (vi.pointerLocation != 0 || $('#current_line').prev().html() != null)) //beginning of the preceding word
					{
						var cur = $("#current_line");
						if(vi.pointerLocation == 0)
						{
							$prevLine = $pointer.parent().parent().prev();
							if($pointer.parent().parent().prev().html() != null)
							{
								var location = $prevLine.text().length;
								var prvTxt = $prevLine.text().slice(0, vi.pointerLocation);
								var curTxt = $prevLine.text().slice(vi.pointerLocation, vi.pointerLocation+1);
								var aftrTxt = $prevLine.text().slice(vi.pointerLocation+1);
								$prevLine.html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');
							}
							$("#current_line").html($("#current_line").text()).removeAttr("id").prev().attr("id", "current_line");
						}
						else
						{
							var location = $pointer.prev().text().lastIndexOf(' ', vi.pointerLocation-2);
						}
						$pointer = $(pointer);
						vi.pointerLocation = location;
						$line = $pointer.parent().parent();
						if(location >= 0)
						{
							vi.pointerLocation ++;
						}
						else
						{
							vi.pointerLocation = 0;
						}
						var prvTxt = $line.text().slice(0, vi.pointerLocation);
						var curTxt = $line.text().slice(vi.pointerLocation, vi.pointerLocation+1);
						var aftrTxt = $line.text().slice(vi.pointerLocation+1);
						$line.html('<span class="input"><span class="before">'+prvTxt+'</span><span class="selected">'+curTxt+'</span><span class="after">'+aftrTxt+'</span></span>');
					}
				}
				else
				{
					// If the key isn't "enter" and the control key isn't pressed, then append the pressed key to the screen
					if(keycode != key.enter && e.ctrlKey == false)
					{
						var keyTxt = String.fromCharCode(keycode);
						$pointer.parent().children(".before").append(keyTxt);
					}
					else
					{
						var commandInput = $pointer.parent().text();
						vi.processInput(commandInput);
						vi.command = false;
					}
				}
			},
			insertKeyDown : function(e)
			{
				$pointer = $(pointer);
				if(window.event) {
					keycode = window.event.keyCode;
				}else if(e) {
					keycode = e.which;
				}

				if(keycode == key.escape) //escape key
				{

					$this.off("keypress.viInsertKeyPress");
					$this.off("keydown.viInsertKeyDown");
					$this.on("keydown.viKeyDown", vi.cmdKeyDown);
					$this.on("keypress.viKeyPress", vi.cmdKeyPress);
					
					$("#viInput").html("");
				}
				vi.navigation(e);
				navigation(e, true, function () {
					if(e.which == key.backspace) 
					{
						e.preventDefault();
						if(vi.pointerLocation == 0)
						{
							var letter = $("#current_line").text().slice(0,1);
							var text = $("#current_line").text().slice(1);
							$prev = $("#current_line").prev();
							if($prev.html() !== null)
							{
								$("#current_line").remove()
								$prev.attr("id", "current_line");
								vi.pointerLocation = $prev.text().length;
								var prevText = $prev.text();
								$prev.html("<span class='input'><span class='before'>"+prevText+"</span><span class='selected'>"+letter+"</span><span class='after'>"+text+"</span></span>");
							}
						}
						else if(vi.pointerLocation > 0)
						{
							vi.pointerLocation--;
						}
					}
					if(e.which == key.delete && vi.pointerLocation >= $(pointer).parent().text().length)
					{
								console.log("jere");
							$nxt = $("#current_line").next();
							if(!$nxt.hasClass("empty"))
							{
								console.log("jere");
								var letter = $nxt.text().slice(0,1);
								var text = $nxt.text().slice(1);
								$("#current_line").find(".after").html(text);
								$("#current_line").find(".selected").html(letter);
								$nxt.remove();
							}
					}

				});
				vi.pointerDisplay();
			},

			insertKeyPress : function(e)
			{
				$pointer = $(pointer);
				var keycode = null;
				if(window.event) {
					keycode = window.event.keyCode;
				}else if(e) {
					keycode = e.which;
				}
				// If the key isn't "enter" and the control key isn't pressed, then append the pressed key to the screen
				if(keycode != key.enter && e.ctrlKey == false)
				{
					var keyTxt = String.fromCharCode(keycode);
					vi.pointerLocation++;
					$pointer.parent().children(".before").append(keyTxt);
				}
				else
				{
					var curTxt = $("#current_line").find('.selected').text();
					var afterTxt = $("#current_line").find('.after').text();
					$("#current_line").find('.after').text('');
					$("#current_line").find('.selected').text('');
					$("#current_line").html($("#current_line").text()).removeAttr("id").after("<p id='current_line'><span class='input'><span class='before'></span><span class='selected'>"+curTxt+"</span><span class='after'>"+afterTxt+"</span></span></p>");
					vi.pointerLocation = 0;
				}
			},
			throwError : function(errorTxt)
			{
				$("#viInput").addClass("inputError").html(errorTxt);
			},
			optionListener : function(txt) {
				$this.on("keypress.options", function(e) {
					var keycode = null;
					if(window.event) {
						keycode = window.event.keyCode;
					}else if(e) {
						keycode = e.which;
					}
					var keyChar = String.fromCharCode(keycode);
					if(txt == "d")
					{
						if(keyChar == "d")
						{
							$("#current_line").prev().attr("id", "current_line").end().remove();
							vi.redrawLine();
						}
						else if(keyChar == 'w')
						{
							var afterTxt = $("#current_line .after").text().match(/^[a-z0-9]+(.*)/i);
							if(afterTxt[1][0] == " ")
							{
								afterTxt[1] = afterTxt[1].substr(1);
							}
							$("#current_line .after").text(afterTxt[1]);
							$("#current_line .selected").text("");
							vi.redrawLine();
						}
					}
					if(txt == "Z" && keyChar == "Z")
					{
						$("#current_line").html($("#current_line").text()).removeAttr("id");
						$(".empty").remove();
						if(settings.filename.match(/\.exe$/))
						{
							vi.updateFile(settings.filename, $("#viWindow").html(), $("#viWindow").text());
						}
						else
						{
							vi.updateFile(settings.filename, $("#viWindow").html());
						}
						vi.unload();
					} 
					$this.off("keypress.options");
					$this.on("keydown.viKeyDown", vi.cmdKeyDown);
					$this.on("keypress.viKeyPress", vi.cmdKeyPress);
				});
			},
			contentPresent : function()
			{
				var text = $("#current_line").text();
				var slicedString = text.slice(1);
				var firstLetter = text.slice(0,1);
				inTheMiddle = true;
				$("#viWindow p:first-child").html("<span class='input'><span class='before'></span><span class='selected'>"+firstLetter+"</span><span class='after'>"+slicedString+"</span></span>");
			},

			processInput : function(command)
			{
				switch(command)
				{
					case "q!":
						vi.unload();
						break;
					case "q":
						$cloned = $("#viWindow").clone();
						var $cl = $cloned.find("#current_line");
						$cl.html($cl.text()).removeAttr("id");
						$cloned.find(".empty").remove();
						if($cloned.html() != vi.original)
						{
							vi.throwError("E37: No write since last change (add ! to override)");
						}
						else
						{
							vi.unload();
						}
						break;
					case "quit!":
						vi.unload();
						break;
					case "quit":
						$cloned = $("#viWindow").clone();
						var $cl = $cloned.find("#current_line");
						$cl.html($cl.text()).removeAttr("id");
						$cloned.find(".empty").remove();
						if($cloned.html() != vi.original)
						{
							vi.throwError("E37: No write since last change (add ! to override)");
						}
						else
						{
							vi.unload();
						}
						break;
					case "wq":
						$("#current_line").html($("#current_line").text()).removeAttr("id");
						$(".empty").remove();
						if(settings.filename.match(/\.exe$/))
						{
							vi.updateFile(settings.filename, $("#viWindow").html(), $("#viWindow").text());
						}
						else
						{
							vi.updateFile(settings.filename, $("#viWindow").html());
						}
						vi.unload();
						break;
					case "w":
					{
						vi.fileMemory.push($("#viWindow").html());
						var $viClone = $("#viWindow").clone();
						$viClone.find("#current_line").html($viClone.find("#current_line").text()).removeAttr("id");
						$viClone.find(".empty").remove();
						if(settings.filename.match(/\.exe$/))
						{
							vi.updateFile(settings.filename, $viClone.html(), $viClone.text());
						}
						else
						{
							vi.updateFile(settings.filename, $viClone.html());
						}

						var lines = $("#viWindow p:not(.empty)").length;
						var characters = $("#viWindow p:not(.empty)").text().length + lines;
						var fileOpenTxt = '"'+settings.filename+'" '+lines+'L, '+characters+'C written';

						$("#viInput").html(fileOpenTxt);

						break;
					}
					case "x":
						$("#current_line").html($("#current_line").text()).removeAttr("id");
						$(".empty").remove();
						if(settings.filename.match(/\.exe$/))
						{
							vi.updateFile(settings.filename, $("#viWindow").html(), $("#viWindow").text());
						}
						else
						{
							vi.updateFile(settings.filename, $("#viWindow").html());
						}
						vi.unload();
						break;
					case "0":
						vi.pointerLocation = 0;
						$("#current_line").html($("#current_line").text()).removeAttr("id");
						$("#viWindow p:first-child").attr("id", "current_line");
						vi.redrawLine();
						break;
					case "$":
						vi.pointerLocation = 0;
						$("#current_line").html($("#current_line").text()).removeAttr("id");
						$("#viWindow p:not(.empty):last").attr("id", "current_line");
						vi.redrawLine();							
						break;
					default:
					if(num = command.match(/^[0-9]+$/))
					{
						vi.pointerLocation = 0;
						$("#current_line").html($("#current_line").text()).removeAttr("id");
						if(!$("#viWindow p:nth-child("+num[0]+")").hasClass("empty"))
						{
							$("#viWindow p:nth-child("+num[0]+")").attr("id", "current_line");
						}
						else
						{
							$("#viWindow p:not(.empty):last").attr("id", "current_line");
						}
						vi.redrawLine();							
					}
					else if(file = command.match(/^r (.*)$/))
					{
						tree = file[1].split("/");
						fileName = tree.pop();

						newLocation = settings.filesystem;
						for(i in tree)
						{
							if(newLocation[tree[i]])
							{
								newLocation = newLocation[tree[i]];
							}
							else
							{
								vi.throwError("E484: Can't open file "+file[1])
							}
						}
						if(newLocation._files[file[1]])
						{
							$("#current_line").after(newLocation._files[file[1]].contents);
							$("#viInput").empty();
						}
						else
						{
							vi.throwError("E484: Can't open file "+file[1])
						}
					}
					else
					{
						vi.throwError("E492: Not an editor command: "+command);
					}
				}
				vi.redrawLine();
				$("#viInput").html($("#viInput").text());
			},

			updateFile : function(filename, txt, func)
			{
				current = settings.filesystem;
				parsedTxt = txt.replace(/("|'")/gi, "\\\\\\$1");
				if(filename.match(/\.exe$/))
				{
					var adder = new Function(func);
					 
					if(current._files[filename])
					{
						current._files[filename].execute = adder;
						current._files[filename].contents = parsedTxt;
					}
					else
					{
						current._files[filename] =  {
							execute : adder,
							contents : parsedTxt,
						};
					}
				}
				else
				{
					if(!current._files) 
					{
						current._files = {};
					}
					if(current._files[filename])
					{
						current._files[filename].contents = parsedTxt;
					}
					else
					{
						current._files[filename] =  {
							contents : parsedTxt,
						};
					}			

				}
			},
		}
		// globalizing the element that's been called
		var element = this;

		var navigation = function(e, deleteOption, callback)
		{
			$pointer = $(pointer)
			if(!deleteOption){
				deleteOption = false;
			}
			if(deleteOption == true)
			{
				if(e.which == key.delete) //delete key
				{
					var input = $pointer.parent().children(".after").text();
					var slicedString = input.slice(1);
					var firstLetter = input.slice(0, 1);
					$pointer.parent().children(".selected").text(firstLetter);
					$pointer.parent().children(".after").text(slicedString);
				}
				else if(e.which == key.backspace) //backspace
				{
					e.preventDefault();
					var string = $pointer.parent().children(".before").text().slice(0, -1);
					$pointer.parent().children(".before").text(string);
				}
			}
			else
			{
				if(e.which == 8)
				{
					e.preventDefault();
				}
			}
			if(e.which == key.left_arrow) //left arrow
			{
				var input = $pointer.parent().children(".before").text();
				if(input.length > 0)
				{
					var slicedString = input.slice(0, -1);
					var lastLetter = input.slice(-1);
					$pointer.parent().children(".after").text($pointer.parent().children(".selected").text()+$pointer.parent().children(".after").text());
					$pointer.parent().children(".selected").text(lastLetter);
					$pointer.parent().children(".before").text(slicedString);						
				}
			}
			else if(e.which == key.right_arrow) //right arrow
			{
				var input = $pointer.parent().children(".after").text();
				var slicedString = input.slice(1);
				var firstLetter = input.slice(0, 1);
				$pointer.parent().children(".before").text($pointer.parent().children(".before").text()+$pointer.parent().children(".selected").text());
				$pointer.parent().children(".selected").text(firstLetter);
				$pointer.parent().children(".after").text(slicedString);
			}

			if(callback)
			{
				callback();
			}	
		}

		// This is where the real meat of everything is....
		return this.each(function() {
			pointer = ".selected:visible";
			$this.addClass("jqvi").addClass("black");
			// Add the jqcmd class and the style class
			vi.load();
		});
	};
})( jQuery );