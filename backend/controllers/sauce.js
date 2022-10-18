const Sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
    .catch(error => { res.status(400).json( { error })})
 };

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non autorisé !'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Sauce modifiée !'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({_id: req.params.id}).then(
    () => {
      res.status(200).json({
        message: 'Sauce supprimée !'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            switch (req.body.like)
            {
                case 1:
                    if (sauce.usersLiked.includes(req.auth.userId)) // IdUser déjà dans le tableau des usersLiked
                    {
                        res.status(401).json({ message : 'Non autorisé !'});
                    } 
                    else 
                    {
                        sauce.likes++;
                        sauce.usersLiked.push(req.auth.userId);
                        Sauce.updateOne({ _id: req.params.id}, { likes: sauce.likes, usersLiked: sauce.usersLiked})
                            .then(() => res.status(200).json({message : 'Like ajouté !'}))
                            .catch(error => res.status(401).json({ error }));
                    }
                    break;

                case 0:
                    if (sauce.usersDisliked.includes(req.auth.userId)) // IdUser déjà dans le tableau des usersDisiked
                    {
                        sauce.dislikes--;
                        const index = sauce.usersDisliked.indexOf(req.auth.userId);
                        delete sauce.usersDisliked[index];
                        Sauce.updateOne({ _id: req.params.id}, { dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked})
                            .then(() => res.status(200).json({message : 'Dislike supprimé !'}))
                            .catch(error => res.status(401).json({ error }));
                    } 
                    else if (sauce.usersLiked.includes(req.auth.userId))
                    {
                        sauce.likes--;
                        const index = sauce.usersLiked.indexOf(req.auth.userId);
                        delete sauce.usersLiked[index];
                        Sauce.updateOne({ _id: req.params.id}, { dislikes: sauce.likes, usersLiked: sauce.usersLiked})
                            .then(() => res.status(200).json({message : 'Like supprimé !'}))
                            .catch(error => res.status(401).json({ error }));
                    }
                    break;


                case -1:
                    if (sauce.usersDisliked.includes(req.auth.userId)) // IdUser déjà dans le tableau des usersDisiked
                    {
                        res.status(401).json({ message : 'Non autorisé !'});
                    } 
                    else 
                    {
                        sauce.dislikes++;
                        sauce.usersDisliked.push(req.auth.userId);
                        Sauce.updateOne({ _id: req.params.id}, { dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked})
                            .then(() => res.status(200).json({message : 'Dislike ajouté !'}))
                            .catch(error => res.status(401).json({ error }));
                    }
                    break;

            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
  };