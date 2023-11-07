using System.Net.WebSockets;
using System.Text.Json;

namespace backend
{
    public static class Extensions
    {
        public static async Task sendMessage(this WebSocket webSocket, string message)
        {
            byte[] responseBytes = System.Text.Encoding.UTF8.GetBytes(message);

            await webSocket.SendAsync(
                    new ArraySegment<byte>(responseBytes, 0, responseBytes.Count()),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None);
        }

        public static async Task<System.Tuple<WebSocketReceiveResult?, List<byte>>> receiveMessage(this WebSocket webSocket)
        {
            List<byte> bufferBuffer = new List<byte>();
            var buffer = new byte[1024 * 4];
            WebSocketReceiveResult? receiveResult = null;
            do
            {
                receiveResult = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(buffer), CancellationToken.None);

                bufferBuffer.AddRange(buffer.Take(receiveResult.Count));
            } while (!(receiveResult?.EndOfMessage ?? true));
            return Tuple.Create(receiveResult, bufferBuffer);
        }
    }
}
