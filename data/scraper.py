import csv
import requests
from bs4 import BeautifulSoup
import json
import io

def extraer_metadatos(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        html_tag = soup.find('html')
        idioma = html_tag.get('lang') if html_tag and html_tag.has_attr('lang') else 'Desconocido'
        
        titulo = soup.find("meta", property="og:title") or soup.find("title")
        descripcion = soup.find("meta", property="og:description") or soup.find("meta", attrs={"name": "description"})
        imagen = soup.find("meta", property="og:image")
        
        return {
            "idioma": idioma.split('-')[0].upper(),
            "titulo": titulo.get("content") if titulo and titulo.name == "meta" else (titulo.string if titulo else "Sin título"),
            "descripcion": descripcion.get("content") if descripcion else "Sin descripción",
            "imagen": imagen.get("content") if imagen else "https://via.placeholder.com/300x150?text=STEM"
        }
    except Exception as e:
        print(f"Error accediendo a {url}: {e}")
        return None

# --- AQUÍ PONES EL ID DE TU GOOGLE SHEET ---
SHEET_ID = '1iELXP9klxtnV3OcuJcV6gDnc5Ams3z3Swbs1knii60o'
# -------------------------------------------

# Construimos la URL de exportación directa de Google
url_google_sheet = f'https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv'

print("Descargando datos directamente desde Google Sheets...")

try:
    response_sheet = requests.get(url_google_sheet)
    response_sheet.encoding = 'utf-8' # <-- AÑADE ESTA LÍNEA AQUÍ
    response_sheet.raise_for_status() # Lanza un error si la descarga falla
except requests.exceptions.RequestException as e:
    print(f"Error al descargar la hoja de cálculo. Verifica que sea pública y el ID sea correcto. Detalle: {e}")
    exit()

# Leemos el contenido descargado en memoria
csv_content = io.StringIO(response_sheet.text)
reader = csv.DictReader(csv_content)

proyectos_finales = []

for row in reader:
    url = row.get('Enlace') 
    if not url or not url.startswith('http'):
        continue
        
    print(f"Procesando: {row.get('Nombre proyecto educativo')}")
    metadatos = extraer_metadatos(url)
    if not metadatos:
        metadatos = {} # Si la web falla, creamos un dicc vacío para no detener el proceso
        
    # Mejora 2: Lógica de la imagen
    id_recurso = row.get('No.', '0')
    id_abreviatura = row.get('Abreviatura', '')
    imagen_extraida = metadatos.get('imagen')
    # Si no hay imagen en la web o devuelve un placeholder, usamos la local de la carpeta img
    if not imagen_extraida or "via.placeholder.com" in imagen_extraida:
        imagen_final = f"img/{id_abreviatura}.jpg"
    else:
        imagen_final = imagen_extraida

    # Mejora 3: Descripción desde la hoja de cálculo
    # Intentamos coger tu columna "Descripcion". Si está vacía, intentamos usar el metadato.
    desc_hoja = row.get('Descripcion', '').strip()
    descripcion_final = desc_hoja if desc_hoja else metadatos.get('descripcion', 'Sin descripción')

    proyecto = {
        "nombre": row.get('Recurso', metadatos.get('titulo', 'Sin nombre')),
        "url": url,
        "descripcion": descripcion_final,
        "imagen": imagen_final,
        "gratuita": row.get('Gratuitas', 'FALSE') == 'TRUE',
        "estudiantes": row.get('Estudiantes', 'FALSE') == 'TRUE',
        "docentes": row.get('Docentes', 'FALSE') == 'TRUE',
        "cyt": row.get('CyT', 'FALSE') == 'TRUE',
        "matematica": row.get('Matematica', 'FALSE') == 'TRUE',
        "programacion": 'code' in url.lower() or 'programación' in descripcion_final.lower(),
        # Mejora 1: Idiomas desde tus columnas
        "espanol": row.get('Espanol', 'FALSE') == 'TRUE',
        "ingles": row.get('Ingles', 'FALSE') == 'TRUE'
    }
    proyectos_finales.append(proyecto)

# Guardar el JSON final en tu carpeta local
with open('data/datos.json', 'w', encoding='utf-8') as f:
    json.dump(proyectos_finales, f, indent=4, ensure_ascii=False)

print("¡Archivo datos.json generado con éxito a partir de Google Sheets!")
