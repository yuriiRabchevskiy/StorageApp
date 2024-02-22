using System;
using System.Text;

namespace BusinessLogic.Helpers.Http
{
    public static class StringUriExtension
    {
        public static Uri CombineToUri(this string baseUri, params string[] chunks)
        {
            var sb = new StringBuilder(baseUri.TrimEnd('/')).Append('/');
            var query = false;
            foreach (var chunk in chunks)
            {
                query = query || chunk.Contains('?');
                var safechunk = query ? chunk : chunk.TrimStart('/', '\\').TrimEnd('/', '\\') + "/";
                sb.Append(safechunk);
            }
            return new Uri(sb.ToString());
        }
    }
}
