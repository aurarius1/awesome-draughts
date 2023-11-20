namespace backend.Game
{
    public class History
    {
        public List<Move> moves { get; set; }
        public List<Move> revertedMoves { get; set; }

        public History()
        {
            moves = new();
            revertedMoves = new();
        }
    }
}
