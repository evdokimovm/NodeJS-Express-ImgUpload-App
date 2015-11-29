var fs = require('fs'),
	path = require('path'),
	sidebar = require('../helpers/sidebar'),
	Models = require('../models');

module.exports = {
	index: function(req, res) {
		// declare our empty viewModel variable object:
		var viewModel = {
			image: {},
			comments: []
		};
		// find the image by searching the filename matching the url parameter:
		Models.Image.findOne({ filename: { $regex: req.params.image_id } },
			function(err, image) {
				if (err) { throw err; }
				if (image) {
					// if the image was found, increment its views counter
					image.views = image.views + 1;
					// save the image object to the viewModel:
					viewModel.image = image;
					// save the model (since it has been updated):
					image.save();
					// find any comments with the same image_id as the image:
					Models.Comment.find({ image_id: image._id}, {}, { sort: { 'timestamp': 1 }},
						function(err, comments){
							if (err) { throw err; }
							// save the comments collection to the viewModel:
							viewModel.comments = comments;
							// build the sidebar sending along the viewModel:
							sidebar(viewModel, function(viewModel) {
								// render the page view with its viewModel:
								res.render('image', viewModel);
							});
						}
					);
				} else {
					// if no image was found, simply go back to the homepage:
					res.redirect('/');
				}
			});
	},
	
	create: function(req, res) {
		var saveImage = function() {
			var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
				imgUrl = '';

			for(var i=0; i < 6; i+=1) {
				imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			var tempPath = req.files.file.path,
				ext = path.extname(req.files.file.name).toLowerCase(),
				targetPath = path.resolve('./public/upload/' + imgUrl + ext);

			if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
				fs.rename(tempPath, targetPath, function(err) {
					if (err) throw err;

					res.redirect('/images/' + imgUrl + ext);
				});
			} else {
				fs.unlink(tempPath, function () {
					if (err) throw err;

					res.json(500, {error: 'Only image files are allowed.'});
				});
			}
		};

		saveImage();
	},
	
	like: function(req, res) {
		res.json({likes: 1});
	},
	
	comment: function(req, res) {
		res.send('The image:comment POST controller');
	}
};
