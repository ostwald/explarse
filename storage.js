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


var LinkManager = Class.extend({
    init: function (dom_root) {
        this.data = null;
        this.key = 'explarseLinks';
        this.$dom = $(dom_root);

        this.initStorage();
//        this.showStoredData();

        this.read();
        this.render();
    },

    /**
    returns link_data for given id and null if link_data not found
    - warns
    */
    getLink: function (id) {
        if (!(id in this.data)) {
            log ("WARN: link not found for \"" + id + "\"");
        }
        else {
            return this.data[id];
        }
    },

    read: function () {
        this.data = this.fetch_json(this.key);
        if (!this.data) {
            alert ("warn: no data read");
            this.data = {}
        }
    },

    write: function () {
        localStorage.setItem(this.key, JSON.stringify(this.data));
    },

    /**
    populate Link Manager dom with html links
    */
    render: function () {
        this.$dom.html('');
        if (this.data == null)
            this.read();
        for (var id in this.data) {
            var link_data = this.data[id];
            this.$dom.append (this._render_link (link_data));
        }
    },

    /**
    Make the html representation of a link for this Link Manager
    */
    _render_link: function (link_data) {

        var link = $t('li')
            .html(link_data.name)
            .attr('id', link_data.id)
            .addClass('exparse-link')
            .click (this.display_query)
        return link;
    },


    add: function (name, query) {
        log ('add: ' + name)
        var id = guid()
        this.data[id] = {
            id:id,
            name:name,
            query:query
        }
        this.write();
        this.render();
    },

    remove: function (id) {
        log ("delete: " + id)
        delete(this.data[id]);
        this.write();
        this.render();
    },

    /**
    Show the render graphical link parse in #QDisplay
    */
    display_query: function  (event) {
        $('#QDisplay').html('');
        var id = $(event.target).attr('id')
        log ("display_query - id: " + id);

        var link_data = LINK_MANAGER.getLink(id);
        var query = link_data.query;
        var tree = PARSER.parse(query);

        var qnode = new CompositeNode(tree, '#QDisplay');
        $('#QDisplay')
            .append($t('div')
                .addClass('display-name')
                .html(link_data.name))
            .append($t('div')
                .addClass('display-query-wrapper')
                .append($t('span')
                    .html("query"))
                .append($t('span')
                    .addClass('display-query')
                    .html(query)))
            .append(qnode.dom);

    },


    /**
    Utils ----------
    */

    /**
        put storage in a known state
    */
    initStorage: function  () {
        localStorage.clear();
        var link_data = [
            {
                name: 'my first link',
                id: guid(),
                query: '!farb:*'
            },
            {
                name: 'xml-dec record',
                id: guid(),
                query: '(ds.MODS:* AND !ds.MODS:"lt;mods")'
            }
        ]

        var explarse_data = {}
        for (var i=0;i<link_data.length;i++) {
            var item_data = link_data[i];
            explarse_data[item_data.id] = item_data;
        }

        localStorage.setItem('explarseLinks', JSON.stringify(explarse_data))
    },

    showStoredData: function () {
        log ('stored data');
        log (stringify(this.fetch_json(this.key)))
    },

    fetch_json: function (key) {
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

})

if (false) {
    // add and remove tester
    $(function () {
        setTimeout (function () {
            var l = {
                name: 'no arks',
                query: '!ark:*'
            }
            LINK_MANAGER.add (l.name, l.query);
        }, 2000);

        setTimeout (function () {
            id = Object.keys(LINK_MANAGER.data)[1]
            LINK_MANAGER.remove (id);
        }, 4000);
    })
}