<?php
header('Content-Type: application/json');
// Autoriser les requêtes CORS si besoin (optionnel)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Chemin du fichier JSON
$file = __DIR__ . '/snake-scores.json';

// Récupérer les données POST
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['score']) || !isset($input['date'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Score ou date manquant']);
    exit;
}

// Charger les scores existants
if (file_exists($file)) {
    $scores = json_decode(file_get_contents($file), true);
    if (!is_array($scores)) $scores = [];
} else {
    $scores = [];
}

// Ajouter le nouveau score
$scores[] = [
    'score' => intval($input['score']),
    'date' => $input['date']
];

// Sauvegarder dans le fichier
file_put_contents($file, json_encode($scores, JSON_PRETTY_PRINT));

echo json_encode(['success' => true, 'scores' => $scores]);
