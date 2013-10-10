<?php

require 'config.php';

header('Content-Type: application/json');
$mysqli = mysqli_init();

if (!$mysqli->real_connect('localhost', $db_user, $db_pass, $db_name))
{
  die('Connection error: ' . mysqli_connect_error());
}

$date = date('Y-m-d G:i:s');

if ($putdata = json_decode(file_get_contents('php://input'), true))
{
    if (isset($putdata['id']))
    {
        $backup = getRecipe($putdata['id'], $mysqli);
        if ($backup)
        {
            // Create backup recipe version
            $insert_query = "
                INSERT INTO recipe_revisions (recipe_id, title, description) VALUES
                ('{$putdata['id']}', '{$putdata['title']}', '{$putdata['description']}')
            ";
            $result = $mysqli->query($insert_query);
        }

        // Update recipe
        $date = date('Y-m-d G:i:s');
        $update_query = "
            UPDATE recipies set
                title = '{$putdata['title']}',
                description = '{$putdata['description']}',
                updated = '{$date}'
            WHERE
                recipe_id = {$putdata['id']}
        ";
        $result = $mysqli->query($update_query);
        echo json_encode(getRecipe($putdata['id'], $mysqli));
        exit();
    } else {
        // Insert recipe
        $insert_query = "
            INSERT INTO recipies (title, description, created, updated) VALUES
            ('{$putdata['title']}', '{$putdata['description']}', '{$date}', '{$date}')
        ";
        $result = $mysqli->query($insert_query);
        echo json_encode(getRecipe($mysqli->insert_id, $mysqli));
        exit();
    }
}

$select_query = "
  SELECT
    r.recipe_id as id,
    r.title,
    r.description,
    r.created
  FROM
    recipies r
    LEFT JOIN recipe_revisions rv
    ON rv.recipe_id = r.recipe_id
";

$recipies = array();
$result = $mysqli->query($select_query);

if ($result)
{
    while($recipe = $result->fetch_assoc()) {
        $recipies[] = $recipe;
    }
}

echo json_encode($recipies);

$mysqli->close();
exit();

function getRecipe($id, $mysqli) {
    $select_query = "
        SELECT
            r.recipe_id as id,
            r.title,
            r.description,
            r.created
        FROM
            recipies r
            LEFT JOIN recipe_revisions rv
            ON rv.recipe_id = r.recipe_id
        WHERE
        r.recipe_id = {$id}
    ";
    $result = $mysqli->query($select_query);
    return ($result) ? $result->fetch_assoc() : false;
}
?>

