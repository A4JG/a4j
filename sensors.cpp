#include <unistd.h>
#include "mcp3008.h"

using namespace std;

int main() {
                // device         // mode // speed // bits per word
  mcp3008Spi a2d("/dev/spidev0.0", SPI_MODE_0, 1e6, 8);

  int channels[] = {0, 1, 2, 3};

  while (1) {
    cout << "{";
    for (int i = 0; i < 4; i++) {
      int channel = channels[i];

      unsigned char data[3];
      data[0] = 1;
      data[1] = 0b10000000 | ((channel & 7) << 4); //specifies ADC channel

      a2d.spiWriteRead(data, sizeof(data));

      int value = (data[1] << 8) & 0b1100000000;
      value |= (data[2] & 0xff);

      cout << "\"channel_" << channel << "\": " << value;

      if (i != 3)
        cout << ",";

    }

    cout << "}" << endl;

    usleep(100000);
  }

  return 0;
}
