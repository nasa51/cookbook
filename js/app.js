var App = new (Backbone.View.extend({
  Models: {
    RecipeItem: Backbone.Model.extend({
      urlRoot: '/recipes',
      defaults: {
        title: "Recipe title...",
        description: "Recipe description...",
        created: new Date(),
        updated: new Date()
      },
      toJSON: function() {
        var attrs = _.clone(this.attributes);
        attrs = _.pick(attrs, 'id', 'title', 'description');
        return attrs;
      }
    })
  },
  Views: {
    RecipeView: Backbone.View.extend({
      tagName: 'article',
      className: 'recipe row-fluid',
      template: _.template(
        '<div class="span2"><small><i class="icon-book"></i> <% var create = new Date(created); %><%= create.toDateString() %></small></div>' +
        '<div class="span3"><a href="/recipe/<%= id %>/view" data-internal="true" class="show"><%= title %></a></div>' +
        '<div class="span3"><a href="/recipe/<%= id %>/edit" data-internal="true" class="edit">edit</a></div>'
      ),
      show: _.template(
        '<header><h3><%= title %></h3></header>' +
        '<content><%= description %></content>' +
        '<div class="controls"><a href="/recipe/<%= id %>/edit" data-internal="true" class="show">Edit</a>' +
          '<a href="/" data-internal="true" class="show">Back</a></div>'
      ),
      initialize: function() {
        this.model.on('hide', this.remove, this);
        this.listenTo(this.model, 'change', this.render);
      },
      render: function() {
        this.$el.html(this.template(this.model.attributes));
      },
      view: function() {
        return this.show(this.model.attributes);
      }
    }),
    RecipeForm: Backbone.View.extend({
      tagName: 'form',
      id: "addRecipe",
      template: _.template(
        '<form id="addRecipe">' +
          '<div class="form-group">' +
            '<label for="title">Title</label>' +
            '<input name=title class="title" type="text" value="<%= title %>" />' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="description">Description</label>' +
            '<textarea name=description class=description><%= description %></textarea>' +
          '</div>' +
          '<a class="btn btn-success">Save</a> ' +
          '<button id="cancel" class="btn btn-danger">Cancel</button>' +
        '</form>'
      ),
      render: function() {
        this.$el.html(this.template(this.model.attributes))
        return this;
      },
      events: {
        'click .btn-success': 'save',
        'click .btn-danger': 'cancel'
      },
      save: function(e) {
        e.preventDefault();
        this.model.save({
            title: this.$('.title').val(),
            description: this.$('.description').val(),
        }, {
          success: function(model, response, options){
            console.log(response);
            Backbone.history.navigate('', { trigger: true });
          },
          error: function(model, xhr, options){
            var errors = JSON.parse(xhr.responseText).errors;
            alert('Oops, something went wrong with saving the TodoItem: ' + errors);
          }
        });
      },
      cancel: function(e) {
        e.preventDefault();
        //COMPLETELY UNBIND THE VIEW
        this.undelegateEvents();
        this.$el.removeData().unbind();
        //Remove view from DOM
        this.remove();
        Backbone.View.prototype.remove.call(this);
        Backbone.history.navigate('', { trigger: true });
      }
    }),
    RecipesListView: Backbone.View.extend({
      initialize: function() {
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.addAll, this);
      },
      addOne: function(recipe) {
        var recipeView = new App.Views.RecipeView({ model: recipe });
        recipeView.render();
        this.$el.append(recipeView.el);
      },
      addAll: function() {
        this.collection.forEach(this.addOne, this);
      },
      render: function() {
        this.addAll();
      }
    })
  },
  Collections: {
    RecipesList: Backbone.Collection.extend({
      url: "/recipes",
      initialize: function() {
        this.on('remove', this.hideModel);
      },
      hideModel: function(model) {
        model.trigger('hide');
      }
    })
  },
  template: _.template(
    '<div id="wrapper" class="container">' +
      '<header>' +
        '<h1>CookBook</h1>' +
      '</header>' +
      '<section id="content"></section>' +
      '<div id="controls">' +
        '<a class="btn btn-success" href="/recipe/new" data-internal="true">New recipe</a> ' +
      '</div>' +
    '</div>'),
  render: function() {
    $('body').html(this.template());
  },
  start: function() {
    this.RecipesRouter.start();
  }
}))({el: document.body});

App.RecipesRouter = new (Backbone.Router.extend({
  routes: {
    "": "index",
    "recipe/:id/view": "show",
    "recipe/:id/edit": "edit",
    "recipe/new": 'newRecipe',
  },
  initialize: function() {
    this.recipesList     = new App.Collections.RecipesList();
    // model: App.Models.RecipeItem,
    this.recipesListView = new App.Views.RecipesListView({ collection: this.recipesList });
    this.recipesList.fetch();
    $(document).delegate('a', 'click', function(e) {
      e.preventDefault();
      Backbone.history.navigate(e.target.pathname, { trigger: true});
    });
  },
  start: function() {
    Backbone.history.start({ pushState: true });
  },
  index: function() {
    $('#content').html(this.recipesListView.el);
  },
  show: function(id) {
    var recipeView = new App.Views.RecipeView({
      model: this.recipesList.get(id)
    });
    $('#content').html(recipeView.view());
  },
  edit: function(id) {
    var recipeForm = new App.Views.RecipeForm({
      model: this.recipesList.get(id)
    });
    $('#content').html(recipeForm.render().el);
  },
  newRecipe: function() {
    var recipeItem = new App.Models.RecipeItem();
    var recipeForm = new App.Views.RecipeForm({ model: recipeItem });
    $('#content').append(recipeForm.render().el);
  }
}));

$(function() {
  App.render();
  App.start();
});

