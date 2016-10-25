
var QNode = Class.extend({
		init: function (json, parent) {
			this.json = json;
			this.$parent_dom = $(parent);
			this.dom = $t('div')
				.addClass('qdom');
				
		},
		render: function () {
			/* log (" --- render ---"); */
			this.$parent_dom.append(this.dom);
		}
});

var FieldExprNode = QNode.extend({
		init: function (json, parent) {
			this._super(json, parent);
			log ("FIELD X");
			log (stringify(this.json));
			this.dom
				.html($t('span').html(json.field).addClass('field-name'))
				.append (' : ')
				.append ($t('span').html(json.value).addClass('field-value'))
			log("dom initialized");
		},
		render: function () {
			this._super();
		}
});

var CompositeNode = QNode.extend({
		
	init: function (json, parent) {
		this._super(json, parent);
		this.connector = this.json.connector || 'ALL'
		this.dom.html($t('div')
			.html(this.connector)
			.addClass('connector'));
		this.children = json.children;
		log (" - " + this.children.length + " children");
		var self = this;
		$(this.children).each (function (i, child) {
			if (child.connector) {
				var comp = new CompositeNode(child, self.dom);
				comp.render();
			}
			else {
				var field_expr = new FieldExprNode (child, self.dom);
				field_expr.render();
			}
		});
	}
		
});


