$(function() {
  var context = {
    dataset: "de_he_giessen",
    siteUrl: "http://openspending.org",
    pagesize: 50
    };

  OpenSpending.scriptRoot = "http://assets.openspending.org/openspendingjs/3662c73";

  OpenSpending.WidgetLink = Backbone.Router.extend({
    routes: {
        "": "home",
        "th/:year/:art": "teilhaushalt", //pg
        "kt/:name/:year/:art": "kostentraeger" //pb
    },

    home: function() {
      OpenSpending.app.navigate('th/2012/Aufwand', {trigger: true});
    },

    teilhaushalt: function(year, art) {
      var state = {
        year: year, 
        prefix: 'th',
        drilldown: "teilhaushalt",
        drilldowns: ["teilhaushalt"],
        cuts: {
          kontotyp: art
        }
      };
      this.render(state, function(name) {
        OpenSpending.app.navigate("kt/" + name + '/' + year + '/' + art, {trigger: true});
      });
    },

    kostentraeger: function(name, year, art) {
      var state = {
        year: year,
        prefix: 'kt/' + name,
        drilldown: "kostentraeger",
        drilldowns: ["kostentraeger"],
        cuts: {
          teilhaushalt: name,
          kontotyp: art
        }
      };
      this.render(state, function(name) {
        console.log("Clicked: " + name);
      });
    },

    render: function(state, callback) {
      var treemap_ctx = _.extend(context, {
        click: function(node) { callback(node.data.name); }
      });

      $('.openspending-link-filter').each(function(i, el) {
        el = $(el);
        var art = state.cuts.kontotyp;
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
      table_dfd.then(function(w) {
        $('.openspending#table_widget').unbind('click', 'td a');
        $('.openspending#table_widget').on('click', 'td a', function(e) {
          var name = $(e.target).data('name') + '';
          callback(name);
          return false;
        });
      });
    }
  });

  OpenSpending.app = new OpenSpending.WidgetLink;
});
