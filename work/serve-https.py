import http.server
import ssl

server_address = ('0.0.0.0', 5500)    
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

# Create an SSL context
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# context.load_cert_chain( certfile='/home/me/projects/ca-authority/web.crt', keyfile='/home/me/projects/ca-authority/web.key')
context.load_cert_chain( certfile='C:\Jobb\Root-CA\web.crt', keyfile='C:\Jobb\Root-CA\web.key')

# Wrap the server's socket
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print("Serving on https://localhost:5500")
httpd.serve_forever()
