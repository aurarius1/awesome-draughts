using System.Net.WebSockets;
using System.Security.Cryptography;
using System.Text;
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

        public static string HashGameState(this string gameState)
        {
            // CODE TAKEN FROM MICROSOFT DOCUMENTATION: 
            // https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.hashalgorithm.computehash?view=net-7.0

            using HashAlgorithm algorithm = SHA512.Create();
            byte[] hashedBytes = algorithm.ComputeHash(Encoding.UTF8.GetBytes(gameState));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hashedBytes.Length; i++)
            {
                sb.Append(hashedBytes[i].ToString("x2"));
            }
            return sb.ToString();
        }

        public static bool VerifyGameState(this string gameState, string hash)
        {
            string newHash = gameState.HashGameState();
            
            return newHash.ToLower().Equals(hash.ToLower());
        }

    }
}
