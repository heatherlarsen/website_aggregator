// Create Websites collection
Websites = new Mongo.Collection("websites");

WebsitesIndex = new EasySearch.Index({
  collection: Websites,
  fields: ['description', 'title'],
  engine: new EasySearch.Minimongo()
});

// Create Comments collection
Comments = new Mongo.Collection("comments");