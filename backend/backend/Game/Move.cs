namespace backend.Game
{
    public class Move
    {
        public int pieceId { get; set; }
        public Position start { get; set; }
        public Position end { get; set; }
        public int killedPieceId { get; set; } = -1;
        public bool pieceUpgraded { get; set; } = false;
    }
}
