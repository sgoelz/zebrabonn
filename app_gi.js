$(function() {
  var context = {
    dataset: "stadt_giessen",
    siteUrl: "http://openspending.org",
    pagesize: 50,
    createLabel: function(widget, domElement, node) {
        if ((node.data.value/widget.total)>0.03) {
          domElement.innerHTML = "<div class='desc'><h2>" + $.format.number(node.data.value, '#,##0.') + "&euro;</h2>" + node.name + "</div>";
        }
      }
    };

  OpenSpending.scriptRoot = "http://clients.openspending.org/zebralog/bonn/openspendingjs";

  OpenSpending.WidgetLink = Backbone.Router.extend({
    routes: {
        "": "home",
        "th/:year/:art": "teilhaushalte", //pg
        "kt/:name/:year/:art": "kostentraeger" //pb
    },

    home: function() {
      OpenSpending.app.navigate('th/2012/Aufwand', {trigger: true});
    },
    
    teilhaushalte: function(year, art) {
      var state = {
        year: '2012', 
        prefix: 'th',
        drilldown: "teilhaushalte",
        drilldowns: ["Teilhaushalte"],
        cuts: {
          Kontotyp: art
        }
      };
      this.render(state, function(name) {
        OpenSpending.app.navigate("kt/" + name + '/' + year + '/' + art, {trigger: true});
      });
    },

    kostentraeger: function(name, year, art) {
      var state = {
        year: '2012',
        prefix: 'kt/' + name,
        drilldown: "kostentraeger",
        drilldowns: ["Kostentraeger"],
        cuts: {
          produktbereich: name,
          Kontotyp: art
        }
      };
      this.render(state, function(pname) {
        var name_parts = pname.split("-");
        document.location.href = 'http://clients.openspending.org/zebralog/bonn/details/' +
          name_parts[0] + '.pdf';
      });
    },

    render: function(state, callback) {
      var treemap_ctx = _.extend(context, {
        click: function(node) { callback(node.data.name); }
      });

      $('.openspending-link-filter').each(function(i, el) {
        el = $(el);
        var art = state.cuts.art;
        var year = state.year;
        if (el.data('year')) {
          if (el.data('year')==year) {
            el.addClass('disable');
          } else {
            year = el.data('year');
            el.removeClass('disable');
          }
        }
        if (el.data('art')) {
          if (el.data('art')==art) {
            el.addClass('disable');
          } else {
            art = el.data('art');
            el.removeClass('disable');
          }
        }

        el.prop('href', '#' + state.prefix + '/' + year + '/' + art);
      });

      var treemap_dfd = new OpenSpending.Treemap($('.openspending#vis_widget'), treemap_ctx, state);
      var table_dfd = new OpenSpending.AggregateTable($('.openspending#table_widget'), context, state);
      $.when(treemap_dfd.promise(), table_dfd.promise()).then(function(w) {
        $('.openspending#table_widget').unbind('click', 'td a');
        $('.openspending#table_widget').on('click', 'td a', function(e) {
          var name = $(e.target).data('name') + '';
          if (name.length<2) name = '0' + name;
          callback(name);
          return false;
        });
      });
    }
  });

  OpenSpending.app = new OpenSpending.WidgetLink;
});