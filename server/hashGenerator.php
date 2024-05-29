<?php
if ($_SERVER['REQUEST_METHOD'] === "POST") {
    $password = $_POST["password"];

    if($password) {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        echo "Hash hesla " .$password . " je: " . $hashedPassword;
    }
}
?>

<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hashování hesel</title>
</head>
<body>
    <h1>Hashování hesel</h1>
    <form method="POST">
        <label for="password">Zadej heslo:</label>
        <input type="password" name="password" id="password" required>
        <button type="submit">Vygeneruj hash</button>
    </form>
</body>
</html>