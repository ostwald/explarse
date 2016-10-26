if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    log ('good to go')
} else {
    // Sorry! No Web Storage support..
}

/*
Link manager

- Read Links - return list of links
These are the same json that is produced by PARSER.parse

- Store link (link)

Link
- id
- name
- qtree

Storage
- LinkStore
a list of links - ids of links. the ids are used to access the link data

link_data = localStorage.getItem(id)

*/



function fetch_json(key) {
    try {
        var data = localStorage.getItem(key);
        if (data == null)
            throw ("bad key: " + key);

        try {
            return JSON.parse(data);
        } catch (error) {
            throw ("data could not be parsed as JSON \"" + key + "\"");
        }
    }
    catch (error) {
        log ("fetch_json error for \"" + key + "\": " + error)
    }
    return null;
}

function initStorage () {
    var link_1_data = {
        name: 'my first link',
        id: '32',
        tree: {
                 "children": [
                   {
                     "field": "foo",
                     "value": "farb"
                   }
                 ],
                 "connector": "ALL"
               }
    }

    localStorage.setItem(link_1_data.id, JSON.stringify(link_1_data))

    var link_2_data = {
        name: 'xml-dec record',
        id: '69',
        tree: {
            "children": [
                {
                    "field": "ds.MODS",
                    "value": "*"
                },
                {
                "children": [
                    {
                    "field": "ds.MODS",
                    "value": "lt;"
                    }
                ],
                "connector": "NONE"
                }
            ],
            "connector": "ALL"
        }
    }

    localStorage.setItem(link_2_data.id, JSON.stringify(link_2_data))

    var toc_data = ['32', '69'];
    localStorage.setItem('explarseLinks', JSON.stringify(toc_data))
}

function showStorageKeys() {
    log ('localStorage keys (' + localStorage.length + ' :')
    for (var i=0;i<localStorage.length;i++) {
        log (i)
        log (" - " + localStorage.key(i));
    }
    log ('-------')
}

function render_explarse_link (event) {
    var id = $(event.target).attr('id')
    log ("RENDER - id: " + id);
    var link_data = fetch_json(id)

    var qnode = new CompositeNode(link_data.tree, '#QDisplay');
    $('#QDisplay').html(qnode.dom);

}

function get_link (link) {

    var link = $t('li')
        .html(link.name)
        .attr('id', link.id)
        .addClass('exparse-link')
        .click (render_explarse_link)
    return link;
}

var LinkManager = Class.extend({
    init: function () {
        this.links = [];
        this.dom = $('#links');

//        $('#links').html($t('li').html("fooberry"))
//        this.link_data = localStorage.explarseLinks;

        initStorage();
//        showStorageKeys()

//        this.links = JSON.parse(localStorage.getItem('explarseLinks'));
        this.links = fetch_json('explarseLinks');
        this.render();
    },

    render: function () {
        log ("RENDER")
        var $root = this.dom
//        $root.html('');
        $(this.links).each (function (i, id) {
            var link = fetch_json(id)
            if (link) {
//                $root.append ($t('li').html(link.name));
               $root.append (get_link (link))
            }
            else {
                $root.append ($t('li').html("link NOT FOUND for " + id));
                log (" - link NOT FOUND for " + id)
            }

        })
    },



    add: function (id, name, tree) {
//        localStorage

    }

})

