CREATE TABLE IF NOT EXISTS `recipies`
(
   `recipe_id`                      int                            NOT NULL AUTO_INCREMENT,
   `title`                          varchar(128),
   `description`                    text,
   `created`                        datetime,
   `updated`                        datetime,
   PRIMARY KEY (`recipe_id`)
);

CREATE TABLE IF NOT EXISTS `recipe_revisions`
(
   `revision_id`                    int                            NOT NULL AUTO_INCREMENT,
   `recipe_id`                      int                            NOT NULL,
   `title`                          varchar(128),
   `description`                    text,
   PRIMARY KEY (`revision_id`)
);
