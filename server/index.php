<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Content-Type: application/json; charset=utf-8");

include ("./DbConnect.php");

$connection = new DbConnect();
$database = $connection->connect();

$method = $_SERVER["REQUEST_METHOD"];

switch ($method) {
    case "GET": {
        $action = $_GET["action"];
        //Kontrola jestli přihlášení
        if ($action == "checkUserName") {
            $responseData = ["sessionExists" => false];
            if (isset($_SESSION["username"])) {
                $responseData["userNameExists"] = true;
                $responseData["username"] = $_SESSION["username"];
            }

            echo json_encode($responseData);
        }
        //Získání posledních dvaceti plateb
        if ($action == "getDefault") {
            $userName = $_GET["userName"];
            $table = ($userName === "tester") ? $table = "payments_test" : $table = "payments";
            $sql = "SELECT * FROM $table ORDER BY date DESC, id DESC";
            $stmt = $database->prepare($sql);
            $stmt->execute();
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($payments, JSON_UNESCAPED_UNICODE);
        }
        //Získání filtrovaných plateb
        if ($action == "getFilteredPayments") {
            $payer = $_GET["payer"];
            $type = $_GET["type"];
            $dateFrom = $_GET["dateFrom"];
            $dateTo = $_GET["dateTo"];
            $userName = $_GET["userName"];
            $table = ($userName === "tester") ? $table = "payments_test" : $table = "payments";
            $sql = "SELECT * FROM $table WHERE 1=1";
            $queryParams = [];
            if (!empty($payer)) {
                $sql .= " AND payer = :payer";
                $queryParams[":payer"] = $payer;
            }
            if (!empty($type)) {
                $sql .= " AND type = :type";
                $queryParams[":type"] = $type;
            }
            if (!empty($dateFrom)) {
                $sql .= " AND date >= :dateFrom";
                $queryParams[":dateFrom"] = $dateFrom;
            }
            if (!empty($dateTo)) {
                $sql .= " AND date <= :dateTo";
                $queryParams[":dateTo"] = $dateTo;
            }
            $sql .= " ORDER BY date DESC, id DESC";
            $stmt = $database->prepare($sql);
            foreach ($queryParams as $param => $value) {
                $stmt->bindValue($param, $value);
            }
            $stmt->execute();
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($payments, JSON_UNESCAPED_UNICODE);
        }
        //Na základě přijatého username se z tabulky users získá heslo příslušného usera.
        if ($action == "handleLogin") {
            $username = $_GET["username"];
            $password = $_GET["password"]; 
            $sql = "SELECT password from users where user = :username";
            $stmt = $database->prepare($sql);
            $stmt->bindValue(":username", $username);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            //Zkontroluje se, zdali se našel uživatel podle přijatého username. Username je unikatní, takže v tabulce bude max jeden daného jména.
            if ($row){
                $hashedPassword = $row["password"];
                if (password_verify($password, $hashedPassword)) {
                    $_SESSION["username"] = $username;
                    echo json_encode(["success" => true, "username" => $username]);
                } else {
                    echo json_encode(["success" => false, "message" => "Chybné heslo."]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Uživatel nenalezen."]);
            }
        }
        if ($action == "handleLogout") {
            unset($_SESSION["username"]);
            session_destroy();
            echo json_encode(["success" => true, "message" => "Odhlášení proběhlo úspěšně."]);
        }
        break;
    }
    //Smazání platby
    case "DELETE": {
        $requestUrl = $_SERVER['REQUEST_URI'];
        $pathSegment = explode("/", trim($requestUrl, "/"));
        $paymentId = (int) $pathSegment[count($pathSegment) - 2];
        $userName = $pathSegment[count($pathSegment) - 1];
        $table = ($userName === "tester") ? $table = "payments_test" : $table = "payments";
        if ($paymentId > 0) {
            $sql = "DELETE FROM $table where id=:id";
            $stmt = $database->prepare($sql);
            $stmt->bindParam(":id", $paymentId, PDO::PARAM_INT);
            if ($stmt->execute()) {
                $data = ["status" => 1, "message" => "Platba vymazána."];
            } else {
                $data = ["status" => 2, "message" => "Chyba při mazání."];
            }
        } else {
            $data = ["status" => 2, "message" => "ID nebylo numerické."];
        }
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        break;
    }
    //Přidání platby
    case "POST": {
        $paymentWithUserName = json_decode(file_get_contents("php://input"));
        $payment = $paymentWithUserName->payment;
        $userName = $paymentWithUserName->userName;
        $table = ($userName === "tester") ? $table = "payments_test" : $table = "payments";
        $sql = "INSERT INTO $table(date, type, amount, payer) VALUES(:date, :type, :amount, :payer)";
        $stmt = $database->prepare($sql);
        $stmt->bindParam(":date", $payment->date);
        $stmt->bindParam(":type", $payment->type);
        $stmt->bindParam(":amount", $payment->amount);
        $stmt->bindParam(":payer", $payment->payer);
        if ($stmt->execute()) {
            $newPayment = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(["status" => 1, "message" => "Platba vložena."], JSON_UNESCAPED_UNICODE);
        } 
        else {
            $data = ["status" => 0, "message" => "Chyba při vložení platby."];
            echo json_encode($data, JSON_UNESCAPED_UNICODE);
        }
        break;
    }
    //Editace platby
    case "PUT": {
        $paymentWithUserName = json_decode(file_get_contents("php://input"));
        $payment = $paymentWithUserName->payment;
        $userName = $paymentWithUserName->userName;
        $table = ($userName === "tester") ? $table = "payments_test" : $table = "payments";
        $sql = "UPDATE $table SET date= :date,type= :type,amount= :amount,payer= :payer WHERE id= :id";
        $stmt = $database->prepare($sql);
        $stmt->bindParam(":id", $payment->id);
        $stmt->bindParam(":date", $payment->date);
        $stmt->bindParam(":type", $payment->type);
        $stmt->bindParam(":amount", $payment->amount);
        $stmt->bindParam(":payer", $payment->payer);
        if($stmt->execute()) {
            echo json_encode(["status" => 1, "message" => "Platba upravena."], JSON_UNESCAPED_UNICODE);
        } 
        else {
            echo json_encode(["status" => 0, "message" => "Platba neupravena."], JSON_UNESCAPED_UNICODE);
        }
    }
}
