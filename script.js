document.getElementById("insert-btn").addEventListener("click", function () {
  const rows = [
    { name: "Sara Brown", dob: "1901-01-01" },
    { name: "John Smith", dob: "1964-01-01" },
    { name: "Jack Ma", dob: "1961-01-30" },
    { name: "Elon Musk", dob: "1999-01-01" },
  ];
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:3000/insert", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.status === 200) {
      document.getElementById("insert-response").innerText =
        "Row inserted successfully: " + xhr.responseText;
    } else {
      document.getElementById("insert-response").innerText =
        "Error inserting row.";
    }
  };

  if (!window.lastInsertedRowIndex) {
    window.lastInsertedRowIndex = 0;
  }
  const row = rows[window.lastInsertedRowIndex % rows.length];
  xhr.send(JSON.stringify(row));
  window.lastInsertedRowIndex++;
});

document
  .getElementById("execute-query-btn")
  .addEventListener("click", function () {
    const query = document.getElementById("sql-query").value.trim();
    if (query.toLowerCase().startsWith("select")) {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        `http://localhost:3000/query?sql=${encodeURIComponent(query)}`,
        true
      );
      xhr.onload = function () {
        if (xhr.status === 200) {
          document.getElementById("query-response").innerText =
            xhr.responseText;
        } else {
          document.getElementById("query-response").innerText =
            "Error executing query.";
        }
      };
      xhr.send();
    } else if (query.toLowerCase().startsWith("insert")) {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:3000/query", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function () {
        if (xhr.status === 200) {
          document.getElementById("query-response").innerText =
            xhr.responseText;
        } else {
          document.getElementById("query-response").innerText =
            "Error executing query.";
        }
      };
      xhr.send(JSON.stringify({ sql: query }));
    } else {
      document.getElementById("query-response").innerText =
        "Only SELECT and INSERT queries are allowed.";
    }
  });
