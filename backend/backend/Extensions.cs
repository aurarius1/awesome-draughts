using System.Text.Json;

namespace backend
{
    public static class StringExtensions
    {
        public static JsonDocument? GetJson(this string source)
        {
            if (source == null)
                return null;

            try
            {
                return JsonDocument.Parse(source);
            }
            catch (JsonException)
            {
                return null;
            }
        }
    }
}
