//let url = 'Corpus/William_Carlos_Williams.txt';
let textbox;
let submit_bttn;
let delete_bttn;
let dropzone;
let filename = false;
let file;
let panel;
let parent_row1, parent_row2;
let container;

let corpus;
let counter = {};
var pos = [];

function preload() {
    //corpus = loadStrings(url);
}

function setup() {
    noCanvas();
    //getLines();
    textbox = select('.text_field');
    container = select('.container');
    submit_bttn = select('.button');
    dropzone = select('.dropzone');
    delete_bttn = select('.delete_bttn');
    panel = select('.show');
    parent_row1 = select('.row1');
    parent_row2 = select('.row2');
    // delete_bttn.hide();
    delete_bttn.mouseClicked(removefile);
    // textbox.changed(updateBttn);
    textbox.elt.addEventListener('keyup',updateBttn);
    textbox.drop(gotFile, loadingFile);
    submit_bttn.mouseClicked(generate);
    dropzone.dragOver(activate_drop);
    dropzone.dragLeave(deactivate_drop);
    dropzone.drop(gotFile, loadingFile);
}

function removefile() {
    if (filename) {
        // console.log(file);
        filename = false;
        textbox.removeAttribute("disabled");
        textbox.elt.value = "";
        updateBttn();
        dropzone.removeClass('drop_collected');
        dropzone.elt.children[0].innerText = "Drop a text file here";
        delete_bttn.hide();
        file = undefined;
        // console.log(file);
        // resultHandler("error");
    }
}

function generate() {
    let flag = submit_bttn.attribute('data-flag');
    if (flag == '1') {
        // console.log("click");
        resultHandler("show");
        corpus = textbox.elt.value.split('\n');
        // console.log(corpus);
        getLines(corpus);
    }
}

function loadingFile() {
    dropzone.elt.children[0].innerText = "Loading text!";
}

function gotFile(f) {
    file = f;
    if (dropzone.hasClass('drop_active')) {
        dropzone.removeClass('drop_active');
    };
    // console.log(file);
    if (file.type == 'text') {
        filename = file.name;
        delete_bttn.show();
        dropzone.elt.children[0].innerText = filename;
        dropzone.addClass('drop_collected');
        // console.log(file.data.length);
        textbox.elt.value = file.data;
        textbox.attribute('disabled', true);
        updateBttn();
    }
    else {
        // delete_bttn.hide();
        if (textbox.elt.value.length > 0 && filename) {
            textbox.removeAttribute("disabled");
            textbox.elt.value = "";
            updateBttn();
        }
        filename = false;
        dropzone.elt.children[0].innerText = "You can only drop a text (.txt) file here";
        dropzone.addClass('drop_error');
        file = undefined;
        // console.log(file);
    };
}


function activate_drop() {
    if (dropzone.hasClass('drop_collected')) {
        delete_bttn.hide();
        dropzone.removeClass('drop_collected');
        dropzone.elt.children[0].innerText = "Replace " + filename;
    } else if (dropzone.hasClass('drop_error')) {
        dropzone.removeClass('drop_error');
        dropzone.elt.children[0].innerText = "Drop a text file here";
    }
    dropzone.addClass('drop_active');
}

function deactivate_drop() {
    if (filename) {
        delete_bttn.show();
        dropzone.addClass('drop_collected');
        dropzone.elt.children[0].innerText = filename;
    } else {
        dropzone.removeClass('drop_error');
        dropzone.elt.children[0].innerText = "Drop a text file here";
    }
    dropzone.removeClass('drop_active');
}


function updateBttn() {
    if (textbox.elt.value.length > 0) {
        let test = textbox.elt.value.split('\n');
        let t = 0;
        for (let i = 0; i < test.length; i++) {
            let temp = [];
            let units = test[i].split(/\W/);
            // console.log("raw",units);
            for (let i = 0; i < units.length; i++) {
                if(units[i].length>0){
                    temp.push(units[i]);
                }
            }
            // console.log("cleaned",temp);
            if (temp.length > t) {
                t = temp.length;
            }
        }
        if (t > 2) {
            submit_bttn.removeClass('disabled');
            submit_bttn.addClass('enabled');
            submit_bttn.attribute('data-flag', '1');
        } else{
            submit_bttn.addClass('disabled');
            submit_bttn.removeClass('enabled');
            submit_bttn.attribute('data-flag', '0');
            resultHandler("error");
        }
    }
    else {
        submit_bttn.addClass('disabled');
        submit_bttn.removeClass('enabled');
        submit_bttn.attribute('data-flag', '0');
        resultHandler("error");
    }
}

function getLines(corpus) {
    counter = {};
    pos = [];

    for (let i = 0; i < corpus.length; i++) {
        let string = new RiString(corpus[i]);
        if (string.length() > 0) {
            // console.log(string);
            let sequence = string.pos();
            let key = "";
            // console.log(string, sequence);
            for (let unit of sequence) {
                if (!RiTa.isPunctuation(unit)) {
                    key += unit + " ";
                }
            }
            key = key.slice(0, -1); //removes " " from last
            if (key.split(/\W/g).length > 2) {
                if (counter[key] == undefined) {
                    counter[key] = 1;
                    pos.push(key);
                }
                else {
                    counter[key] = counter[key] + 1;
                }
            }
        }
        // console.log(corpus[i], counter, pos);
    }

    pos.sort(compare);

    if (pos.length > 0) {
        for (let i = 0; i < pos.length; i++) {
            if (i < 40) {
                // console.log("creating for", pos[i]);
                let p = pos[i];
                let p1 = createP(p+',');
                p1.class('rule');
                p1.parent(parent_row1);

                let p2 = createP(counter[p]);
                p2.class('count');
                p2.parent(parent_row2);
            }
        }
        setTimeout(function () {
            resultHandler("hide");
        }, 1);
    } else {
        resultHandler("error");
    }
}

function compare(a, b) {
    // console.log("sorting...");
    let countA = counter[a];
    let countB = counter[b];
    return countB - countA;
}

function resultHandler(status) {
    if (status == 'show') {
        cleanScreen(parent_row1);
        cleanScreen(parent_row2);
        // console.log("Loading");
        let loader = createP("Loading....");
        loader.parent(parent_row1);
        loader.class('loader')
    }
    else if (status == 'hide') {
        // console.log("Removing Loading....");
        panel.addClass('slide');
        container.addClass('newwidth');
        let loader = select('.loader');
        loader.remove();
    }
    else {
        cleanScreen(parent_row1);
        cleanScreen(parent_row2);
        // console.log("error");
        let loader = select('.loader');
        if (loader) {
            loader.elt.innerText = "Error";
        }
        if (panel.hasClass('slide')) {
            panel.removeClass('slide');
            container.removeClass('newwidth');
        }
    }
}

function cleanScreen(parent) {
    // console.log(parent.elt.childElementCount);
    if (parent.elt.childElementCount) {
        console.log("clearing");
        while (parent.elt.hasChildNodes()) {
            parent.elt.removeChild(parent.elt.firstChild);
        }
    }
}