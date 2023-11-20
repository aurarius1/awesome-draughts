namespace backend.Game
{ 
    public class Field
    {
        public Position position { get; set; }
        public bool containsPiece { get; set; } = false;
        public string? pieceColor { get; set; }
        public int pieceId { get; set; } = -1;


        public void ClearPiece()
        {
            this.pieceColor = "";
            this.pieceId = -1;
            this.containsPiece = false;
        }

        public void SetPiece(int pieceId, string pieceColor)
        {
            this.pieceColor = pieceColor;
            this.pieceId = pieceId;
            this.containsPiece = true;
        }

    }
}
