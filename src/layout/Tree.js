define(function (require) {

    var vec2 = require('zrender/tool/vector');

    function TreeLayout(tree) {
        
        this.tree = tree;
        
        this.nodePadding = 30;

        this.layerPadding = 100;

        this._layerOffsets = [];

        this._layers = [];
    };

    TreeLayout.prototype.run = function () {
        this._layerOffsets.length = 0;
        for (var i = 0; i < this.tree.root.height + 1; i++) {
            this._layerOffsets[i] = 0;
            this._layers[i] = [];
        }
        this._updateNodeXPosition(this.tree.root);
        var root = this.tree.root;
        this._updateNodeYPosition(root, 0, root.layout.height);
    };

    TreeLayout.prototype._updateNodeXPosition = function (node) {
        var minX = Infinity;
        var maxX = -Infinity;
        node.layout.position = node.layout.position || vec2.create();
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            this._updateNodeXPosition(child);
            var x = child.layout.position[0];
            if (x < minX) {
                minX = x;
            }
            if (x > maxX) {
                maxX = x;
            }
        }
        if (node.children.length > 0) {
            node.layout.position[0] = (minX + maxX) / 2;
        } else {
            node.layout.position[0] = 0;
        }
        var off = this._layerOffsets[node.level] || 0;
        if (off > node.layout.position[0]) {
            var shift = off - node.layout.position[0];
            this._shiftSubtree(node, shift);
            for (var i = node.level + 1; i < node.height + node.level; i++) {
                this._layerOffsets[i] += shift;
            }
        }
        this._layerOffsets[node.level] = node.layout.position[0] + node.layout.width + this.nodePadding;

        this._layers[node.level].push(node);
    };

    TreeLayout.prototype._shiftSubtree = function (root, offset) {
        root.layout.position[0] += offset;
        for (var i = 0; i < root.children.length; i++) {
            this._shiftSubtree(root.children[i], offset);
        }
    };

    TreeLayout.prototype._updateNodeYPosition = function (node, y, prevLayerHeight) {
        node.layout.position[1] = y;
        var layerHeight = 0;
        for (var i = 0; i < node.children.length; i++) {
            layerHeight = Math.max(node.children[i].layout.height, layerHeight);
        }
        var layerPadding = this.layerPadding;
        if (typeof(layerPadding) === 'function') {
            layerPadding = layerPadding(node.level);
        }
        for (var i = 0; i < node.children.length; i++) {
            this._updateNodeYPosition(node.children[i], y + layerPadding + prevLayerHeight, layerHeight);
        }
    };

    return TreeLayout;
});