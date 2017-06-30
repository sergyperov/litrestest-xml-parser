var idsArray = [];          // массив всех идентификаторов, найденных в данном XML
var linksArray = [];        // массив всех ссылок (без префикса '#'), найденных в данном XML
var totalTextLength = 0;    // длинна (без пробелов) всего текста, найденного в XML

// данная функция загрузит XML и вызовет функцию для его обработки
function loadXML() {
  var url = new URL(document.location);
  var fileArg = url.searchParams.get("XML");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200)
      parseNode(xhttp.responseXML.documentElement, true);
  }
  xhttp.open("GET", getCurrentFolderPath() + fileArg, true);
  xhttp.send();
}

// возвращает путь к папке, в которой находится index.html
function getCurrentFolderPath() {
  var path = document.location.pathname;
  var index = String(path).lastIndexOf('/');
  var res = path.slice(0, index);
  return res + '/';
}

/**
 * Рекурсивная функция, которая собирает информацию о данной узле и его ветвях (если такие существуют)
 * @param { node } nodeToParse : узел, который нужно пропарсить
 * @param { boolean } isHead : является ли этот узел корнем
*/ 
function parseNode(nodeToParse, isHead) {
  // если это не тег, пропустить
  if (nodeToParse.nodeType != 1)
    return;

  readNode(nodeToParse);

  // вызвать рекурсивную функцию для всеъ ветвей данного узла 
  for (var i = 0; i < nodeToParse.childNodes.length; i++) {
    parseNode(nodeToParse.childNodes[i], false);
    // если мы находмся в корне, подсчитать количество символов (без пробелов) для всей данной ветки корня
    if (isHead) {
      totalTextLength += nodeToParse.childNodes[i].textContent.replace(/\s/g,'').length;
    }
  }

  // на этом этапе рекурсия закончена для всех ветвей данного узла, в случае, если мы в корне, обрабобать полученную информацию
  if (isHead) {
    processNodes();
  } else {
    return;
  }
}

// получает информацию о необходимых атрибутах тега
function readNode(node) {
  var idAtr = node.getAttribute('id');
  var hrefAtr = node.getAttribute('href');
  var lHrefAtr = node.getAttribute('l:href');

  if (idAtr != null)
    idsArray.push(idAtr);

  // только внутренние ссылки!
  if ((hrefAtr != null) && (hrefAtr[0] == '#'))
    linksArray.push(hrefAtr.slice(1));
  if ((lHrefAtr != null) && (lHrefAtr[0] == '#'))
    linksArray.push(lHrefAtr.slice(1));
}

/**
 * Проверит, является ли данная сслыка "правильной" (т.е. id ссылки существует)
 * @param { string } link : ссылка на идентификатор (без префикса '#')
 * @param { array } idsArray : массив со всем идентификаторами
 * @returns : true, если сслыка правильная, false, если "битая"
 */
function isValidLink(link, idsArray) {
  for (var i = 0; i < idsArray.length; i++) {
    if (link == idsArray[i])
      return true;
  }
  return false;
}

/**
 * Обработчик узлов (для поставленной задачи)
 */
function processNodes() {
  idsArray.sort();

  // подсчитаем количество "битых" ссылок
  var invalidLinks = 0;
  for (var i = 0; i < linksArray.length; i++) {
    if (!isValidLink(linksArray[i], idsArray))
      invalidLinks++;
  }

  printData(linksArray.length, totalTextLength, invalidLinks);
}

/**
 * Обновит соответствующие элементы в HTML
 */
function printData(totalLinks, totalTextLength, invalidLinks) {
  document.getElementById('loading').innerHTML = "Готово!";
  document.getElementById('total-links').innerHTML = totalLinks;
  document.getElementById('total-text-length').innerHTML = totalTextLength;
  document.getElementById('invalid-links').innerHTML = invalidLinks;
}

loadXML();