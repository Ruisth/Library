# Library

## Índice
* [Books](#books)
* [Comments](#comments)
* [Livrarias](#livrarias)
* [Users](#users)

## Books
```javascript
{"some": "json"
    {
        "info": {
            "_postman_id": "98b3cdf6-f4b4-4d6d-8e65-bc9ec37117d5",
            "name": "Books",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
            "_exporter_id": "39373734",
            "_collection_link": "https://adad77.postman.co/workspace/Library~ab2fcb92-93a8-4c49-a408-f844c45fe3fc/collection/39373734-98b3cdf6-f4b4-4d6d-8e65-bc9ec37117d5?action=share&source=collection_link&creator=39373734"
        },
        "item": [
            {
                "name": "/books",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books"
                        ]
                    },
                    "description": "### Retrieve Books\n\nThis endpoint sends an HTTP GET request to retrieve a list of books from the server.\n\n#### Response\n\nThe response will be a JSON object with the following schema:\n\n``` json\n{\n  \"type\": \"object\",\n  \"properties\": {\n    \"books\": {\n      \"type\": \"array\",\n      \"items\": {\n        \"type\": \"object\",\n        \"properties\": {\n          \"title\": { \"type\": \"string\" },\n          \"author\": { \"type\": \"string\" },\n          \"isbn\": { \"type\": \"string\" },\n          \"publishedDate\": { \"type\": \"string\", \"format\": \"date\" }\n          // Add more properties as per the actual response\n        },\n        \"required\": [\"title\", \"author\", \"isbn\"]\n      }\n    }\n  },\n  \"required\": [\"books\"]\n}\n\n ```"
                },
                "response": []
            },
            {
                "name": "/books",
                "request": {
                    "method": "POST",
                    "header": [],
                    "body": {
                        "mode": "raw",
                        "raw": "[\r\n    {\r\n        \"title\": \"teste\",\r\n        \"isbn\": \"1234\",\r\n        \"pageCount\": 1223,\r\n        \"publishedDate\": {\r\n            \"$date\": \"2009-04-01T07:00:00Z\"\r\n        },\r\n        \"thumbnailUrl\": \"https://s3.amazonaws.com/AKIAJC5RLADLUMVRPFDQ.book-thumb-images/ables\",\r\n        \"shortDescription\": \"Test book\",\r\n        \"longDescription\": \"Test Boook oookk\",\r\n        \"status\": \"PUBLISH\",\r\n        \"authors\": [\r\n            \"W. Frank Ableson\",\r\n            \"Charlie Collins\",\r\n            \"Robi Sen\"\r\n        ],\r\n        \"categories\": [\r\n            \"Open Source\",\r\n            \"Mobile\"\r\n        ]\r\n    },\r\n    {\r\n        \"title\": \"teste2\",\r\n        \"isbn\": \"1234\",\r\n        \"pageCount\": 1223,\r\n        \"publishedDate\": {\r\n            \"$date\": \"2009-04-01T07:00:00Z\"\r\n        },\r\n        \"thumbnailUrl\": \"https://s3.amazonaws.com/AKIAJC5RLADLUMVRPFDQ.book-thumb-images/ables\",\r\n        \"shortDescription\": \"Test book\",\r\n        \"longDescription\": \"Test Boook oookk\",\r\n        \"status\": \"PUBLISH\",\r\n        \"authors\": [\r\n            \"W. Frank Ableson\",\r\n            \"Charlie Collins\",\r\n            \"Robi Sen\"\r\n        ],\r\n        \"categories\": [\r\n            \"Open Source\",\r\n            \"Mobile\"\r\n        ]\r\n    }\r\n]",
                        "options": {
                            "raw": {
                                "language": "json"
                            }
                        }
                    },
                    "url": {
                        "raw": "{{baseUrl}}/books",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books"
                        ]
                    },
                    "description": "### Create a New Book\n\nThe endpoint [{{baseUrl}}/books](https://baseUrl) is a POST request used to create a new book.\n\n#### Request Body\n\n- title (string): The title of the book\n    \n- isbn (string): The ISBN of the book\n    \n- pageCount (number): The total number of pages in the book\n    \n- publishedDate (date): The date when the book was published\n    \n- thumbnailUrl (string): The URL of the book's thumbnail image\n    \n- shortDescription (string): A brief description of the book\n    \n- longDescription (string): A detailed description of the book\n    \n- status (string): The status of the book (e.g., PUBLISH, DRAFT, etc.)\n    \n- authors (array of strings): The authors of the book\n    \n- categories (array of strings): The categories to which the book belongs\n    \n\n#### API Responses and Corresponding Schemas\n\nThe response of this request is documented as a JSON schema. The possible API responses and their corresponding schemas will be provided in the response documentation."
                },
                "response": []
            },
            {
                "name": "/books/id/:id",
                "event": [
                    {
                        "listen": "test",
                        "script": {
                            "exec": [
                                "var template = `\r",
                                "<style type=\"text/css\">\r",
                                "    .tftable {font-size:14px;color:#333333;width:100%;border-width: 1px;border-color: #87ceeb;border-collapse: collapse;}\r",
                                "    .tftable th {font-size:18px;background-color:#87ceeb;border-width: 1px;padding: 8px;border-style: solid;border-color: #87ceeb;text-align:left;}\r",
                                "    .tftable tr {background-color:#ffffff;}\r",
                                "    .tftable td {font-size:14px;border-width: 1px;padding: 8px;border-style: solid;border-color: #87ceeb;}\r",
                                "    .tftable tr:hover {background-color:#e0ffff;}\r",
                                "</style>\r",
                                "\r",
                                "<table class=\"tftable\" border=\"1\">\r",
                                "    <tr>\r",
                                "        <th>Title</th>\r",
                                "        <th>ISBN</th>\r",
                                "        <th>Page Count</th>\r",
                                "        <th>Published Date</th>\r",
                                "        <th>Authors</th>\r",
                                "        <th>Categories</th>\r",
                                "        <th>Average Score</th>\r",
                                "    </tr>\r",
                                "    \r",
                                "    {{#each response}}\r",
                                "        <tr>\r",
                                "            <td>{{title}}</td>\r",
                                "            <td>{{isbn}}</td>\r",
                                "            <td>{{pageCount}}</td>\r",
                                "            <td>{{publishedDate}}</td>\r",
                                "            <td>{{authors.join(',')}}</td>\r",
                                "            <td>{{categories.join(',')}}</td>\r",
                                "            <td>{{averageScore}}</td>\r",
                                "        </tr>\r",
                                "    {{/each}}\r",
                                "</table>\r",
                                "`;\r",
                                "\r",
                                "function constructVisualizerPayload() {\r",
                                "    return {response: pm.response.json()}\r",
                                "}\r",
                                "\r",
                                "pm.visualizer.set(template, constructVisualizerPayload());"
                            ],
                            "type": "text/javascript",
                            "packages": {}
                        }
                    }
                ],
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books/id/:id",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            "id",
                            ":id"
                        ],
                        "query": [
                            {
                                "key": "id",
                                "value": "1",
                                "disabled": true
                            }
                        ],
                        "variable": [
                            {
                                "key": "id",
                                "value": "20"
                            }
                        ]
                    },
                    "description": "### Get Book by ID\n\nThis endpoint is used to retrieve a specific book by its unique identifier (_id).\n\n#### Responses\n\n- 200 OK:\n    \n    - \"bookId\": \"string\",\"title\": \"string\",\"author\": \"string\",\"description\": \"string\",\"averageScore\": \"number\",\"comments\": \\[ { \"commentId\": \"string\", \"text\": \"string\", \"user\": \"string\" }\\]}\n        \n    - Description: If the request is successful, the response will include the complete information of the book, the average score, and a list of all comments.\n        \n- 404 Not Found:\n    \n    - Description: If the specified book _id is not found in the database, the response will indicate that the book was not found."
                },
                "response": []
            },
            {
                "name": "/books/:id",
                "request": {
                    "method": "DELETE",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books/:id",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            ":id"
                        ],
                        "variable": [
                            {
                                "key": "id",
                                "value": "42"
                            }
                        ]
                    },
                    "description": "### Delete Book by ID\n\nThis endpoint is used to delete a book by its unique identifier (_id).\n\n#### Request\n\n- Method: `DELETE`\n    \n- URL: `http://localhost:3000/books/:id`\n    \n\n#### Responses\n\n- 200 OK: The book with the specified ID has been successfully deleted.\n    \n    - Response Body: N/A\n        \n- 404 Not Found: The book with the specified ID does not exist.\n    \n    - Response Body: N/A"
                },
                "response": []
            },
            {
                "name": "/books/:id",
                "request": {
                    "method": "PUT",
                    "header": [],
                    "body": {
                        "mode": "raw",
                        "raw": "{\r\n    \"title\": \"testinho\"\r\n}",
                        "options": {
                            "raw": {
                                "language": "json"
                            }
                        }
                    },
                    "url": {
                        "raw": "{{baseUrl}}/books/:id",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            ":id"
                        ],
                        "variable": [
                            {
                                "key": "id",
                                "value": "41"
                            }
                        ]
                    },
                    "description": "### Update Livro\n\nThis endpoint is used to update a livro using the HTTP PUT method.\n\n#### Possible API Responses\n\n- 200 OK: The livro was successfully updated. The response will contain the updated livro details. The data structure of the response will include the updated livro details.\n    \n- 400 Bad Request: If the request is invalid or malformed, this response will be returned.\n    \n- 401 Unauthorized: If authentication is required and has failed or has not yet been provided, this response will be returned.\n    \n- 404 Not Found: If the livro to be updated is not found, this response will be returned.\n    \n\nThe format of the response for a successful update (200 OK) will include the updated livro details."
                },
                "response": []
            },
            {
                "name": "/books/top/:limit",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books/top/:limit",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            "top",
                            ":limit"
                        ],
                        "variable": [
                            {
                                "key": "limit",
                                "value": "2"
                            }
                        ]
                    },
                    "description": "### Get Books by Score\n\nThis endpoint retrieves a list of books with the highest average score, sorted in descending order. The response includes complete information about each book.\n\n#### Request Parameters\n\n- `limit` (query parameter): Limit the total number of books in the response.\n    \n\n#### API Response\n\nThe API response will be in JSON format and will include an array of objects, each representing a book with the following properties:\n\n- `id` (string): The unique identifier of the book.\n    \n- `title` (string): The title of the book.\n    \n- `author` (string): The author of the book.\n    \n- `score` (number): The average score of the book.\n    \n\nExample response:\n\n``` json\n[\n    {\n        \"id\": \"123\",\n        \"title\": \"Sample Book 1\",\n        \"author\": \"Author 1\",\n        \"score\": 4.5\n    },\n    {\n        \"id\": \"456\",\n        \"title\": \"Sample Book 2\",\n        \"author\": \"Author 2\",\n        \"score\": 4.2\n    }\n]\n\n ```"
                },
                "response": []
            },
            {
                "name": "/books/ratings/:order",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books/ratings/:order",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            "ratings",
                            ":order"
                        ],
                        "variable": [
                            {
                                "key": "order",
                                "value": "desc"
                            }
                        ]
                    },
                    "description": "### Get List of Books by Total Reviews\n\nThis endpoint retrieves a list of books sorted by the total number of reviews.\n\n#### Request Parameters\n\n- `order` (query parameter) - Specify the order of the list, either \"asc\" for ascending or \"desc\" for descending.\n    \n\n#### API Response\n\nThe API response will be in JSON format with the following structure:\n\n- `books` (array of objects) - An array containing the details of the books.\n    \n    - `title` (string) - The title of the book.\n        \n    - `author` (string) - The author of the book.\n        \n    - `total_reviews` (number) - The total number of reviews for the book.\n        \n\nExample:\n\n``` json\n{\n  \"books\": [\n    {\n      \"title\": \"Book Title 1\",\n      \"author\": \"Author Name 1\",\n      \"total_reviews\": 100\n    },\n    {\n      \"title\": \"Book Title 2\",\n      \"author\": \"Author Name 2\",\n      \"total_reviews\": 85\n    }\n  ]\n}\n\n ```\n\n#### Possible API Responses and Status Codes\n\n- 200 OK: The request was successful, and the response body contains the list of books sorted by total reviews in the specified order.\n    \n- 400 Bad Request: The request was invalid or missing the required parameters.\n    \n- 404 Not Found: The requested resource was not found."
                },
                "response": []
            },
            {
                "name": "/books/star",
                "protocolProfileBehavior": {
                    "disabledSystemHeaders": {}
                },
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books/star",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            "star"
                        ]
                    },
                    "description": "### Get Books with 5-Star Reviews\n\nThis endpoint retrieves a list of books with more than 5-star reviews. It displays all the information about the book and the number of reviews equal to 5.\n\n#### Possible Responses\n\n- 200 OK: The request was successful. The response will contain a JSON array with details of books meeting the specified criteria. The response body will include the following structure:\n    \n    - `book_id` (string): The unique identifier of the book.\n        \n    - `title` (string): The title of the book.\n        \n    - `author` (string): The author of the book.\n        \n    - `genre` (string): The genre of the book.\n        \n    - `published_date` (string): The published date of the book.\n        \n    - `reviews` (array): An array containing details of reviews for the book.\n        \n        - `review_id` (string): The unique identifier of the review.\n            \n        - `rating` (number): The rating given in the review.\n            \n        - `comment` (string): The comment provided in the review.\n            \n- 404 Not Found: If no books matching the criteria are found, this status code will be returned."
                },
                "response": []
            },
            {
                "name": "/books/year/:year",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books/year/:year",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            "year",
                            ":year"
                        ],
                        "variable": [
                            {
                                "key": "year",
                                "value": "2010"
                            }
                        ]
                    },
                    "description": "This API endpoint retrieves a list of books that have been reviewed in the specified year.\n\n### API Response\n\nThe API response will be in JSON format and will contain the following key-value pairs:\n\n- `book_id`: (integer) The unique identifier for the book.\n    \n- `title`: (string) The title of the book.\n    \n- `author`: (string) The author of the book.\n    \n- `rating`: (float) The rating given to the book.\n    \n- `reviewer`: (string) The name of the reviewer.\n    \n\nExample of a response:\n\n``` json\n[\n    {\n        \"book_id\": 1234,\n        \"title\": \"Sample Book Title\",\n        \"author\": \"Sample Author\",\n        \"rating\": 4.5,\n        \"reviewer\": \"John Doe\"\n    },\n    {\n        \"book_id\": 5678,\n        \"title\": \"Another Book Title\",\n        \"author\": \"Another Author\",\n        \"rating\": 3.8,\n        \"reviewer\": \"Jane Smith\"\n    }\n]\n\n ```"
                },
                "response": []
            },
            {
                "name": "/books/comments",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books/comments",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            "comments"
                        ]
                    },
                    "description": "### Retrieve Books with Comments\n\nThis API endpoint retrieves a list of books that have comments, sorted by the total number of comments.\n\n#### API Responses\n\nThe API response will include an array of objects, where each object represents a book with the following properties:\n\n- `bookId`: (string) The unique identifier of the book.\n    \n- `title`: (string) The title of the book.\n    \n- `author`: (string) The author of the book.\n    \n- `totalComments`: (number) The total number of comments for the book.\n    \n\nExample response:\n\n``` json\n[\n    {\n        \"bookId\": \"123\",\n        \"title\": \"Sample Book 1\",\n        \"author\": \"Author 1\",\n        \"totalComments\": 10\n    },\n    {\n        \"bookId\": \"456\",\n        \"title\": \"Sample Book 2\",\n        \"author\": \"Author 2\",\n        \"totalComments\": 5\n    }\n]\n\n ```"
                },
                "response": []
            },
            {
                "name": "/books/job",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books/job",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            "job"
                        ]
                    },
                    "description": "### API Request Description\n\nThis API endpoint retrieves the total number of reviews for a specific job title \"job\".\n\n### API Response\n\nThe API response will include the following data formats:\n\n- **Success Response:**\n    \n    - Status Code: 200 OK\n        \n    - Data Format: JSON\n        \n        - job (string): The job title.\n            \n        - total_reviews (number): The total number of reviews for the job.\n            \n- **Error Responses:**\n    \n    - Status Code: 4xx, 5xx\n        \n    - Data Format: JSON\n        \n        - message (string): A message indicating the error."
                },
                "response": []
            },
            {
                "name": "/books/.../.../...",
                "request": {
                    "method": "GET",
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}/books/filter?category=Mobile",
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [
                            "books",
                            "filter"
                        ],
                        "query": [
                            {
                                "key": "category",
                                "value": "Mobile"
                            },
                            {
                                "key": "author",
                                "value": "Robi Sen",
                                "disabled": true
                            },
                            {
                                "key": "price",
                                "value": null,
                                "disabled": true
                            }
                        ]
                    },
                    "description": "### API Request Description\n\nThis endpoint retrieves a list of books filtered by category. The `category` parameter is used to specify the category for filtering.\n\n### API Response\n\n- **200 OK** - The request was successful. The response body contains an array of objects, each representing a book with the following attributes:\n    \n    - `title` (string): The title of the book.\n        \n    - `author` (string): The author of the book.\n        \n    - `price` (number): The price of the book.\n        \n    - `category` (string): The category of the book.\n        \n- **400 Bad Request** - The request was invalid or malformed. The response body may contain details about the error.\n    \n- **404 Not Found** - The requested resource was not found.\n    \n- **500 Internal Server Error** - The server encountered an unexpected condition which prevented it from fulfilling the request."
                },
                "response": []
            }
        ],
        "variable": [
            {
                "key": "order",
                "value": "asc"
            }
        ]
    }
}
```

## Comments

## Livrarias

## Users
