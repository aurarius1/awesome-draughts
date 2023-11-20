namespace backend
{
    public class ThisShouldNotHappenException : Exception
    {
        public ThisShouldNotHappenException(): base("THIS SHOULD NOT HAPPEN") {
        }
    }
}
