namespace backend.Game
{
    public class Pieces
    {
        public Pieces()
        {
            white = new();
            black = new();
        }

        public Dictionary<int, Piece> white { get; set; }
        public Dictionary<int, Piece> black { get; set; }
    }
}
