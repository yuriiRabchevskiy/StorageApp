using System;
using System.Net.Http;
using Newtonsoft.Json;

namespace BusinessLogic.Helpers.Http
{
    public static class HttpResponseExtensions
    {
        private static readonly Type _stringType = typeof(String);
        public static T ContentAsType<T>(this HttpResponseMessage response)
        {
            var data = response.Content.ReadAsStringAsync().Result;

            if (typeof(T) == _stringType)
            {
                return (T)(object)data;
            }

            return string.IsNullOrEmpty(data) ?
                        default(T) :
                        JsonConvert.DeserializeObject<T>(data);
        }

        public static string ContentAsJson(this HttpResponseMessage response)
        {
            var data = response.Content.ReadAsStringAsync().Result;
            return JsonConvert.SerializeObject(data);
        }

        public static string ContentAsString(this HttpResponseMessage response)
        {
            return response.Content.ReadAsStringAsync().Result;
        }
    }
}
