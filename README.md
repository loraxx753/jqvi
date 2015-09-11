# jqvi

VI emulator with jquery

## Description

Jqvi is a emulator for the unix vi text editor. Not all of the features are present yet, but hopefully soon they will be.

## How to Use

Jqvi is relatively easy to use. In the most basic case all you would need is:

```javascript
// Fullscreen emulation
$("body").jqvi();

/* OR */

// Modular emulation
$(".jqvi_wrapper").jqvi();
```

## Options


### filename (REQUIRED)

the name of the text file that vi will be opening. 
```javascript
$("body").jqvi({
	filename : 'example.txt',
});
```
### filetext

A string containg the text for the file. Each line should be separated by p tags (no other html tags should be used here).

If this option is omitted, then 

```javascript
$("body").jqvi({
	fileText : "<p>one</p><p>two</p><p>three</p><p>four</p>",
});
```

### filesystem

A javascript object that contains folder information that the file will be written to. The file will be written into the {foldername}._files child object.

If this is omitted, it will be written to an empty object.

```javascript
var files = {
  examples : {
    _files : {}
  },
  _files : {},
}

$("body").jqvi({
  	filesystem : files.examples,
});
```

### unloadCallback

The callback function to be run once vi is closed (like with :q or :wq).

If this is omitted than it will just become a blank screen.

```javascript
$("body").jqvi({
    unloadCallback : function() {
      alert("vi has been closed.");
    }
  },
});
```
