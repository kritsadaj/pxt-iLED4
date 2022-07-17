/**
 * makecode iLED4 4 Digit 7 Segment with I2C Bus Package
 */
enum iLED4_CMD {TURN_OSCILLATOR_ON = 0x21, TURN_DISPLAY_ON = 0x81, SET_BRIGHTNESS = 0xE0 }

/**
 * iLED4 block
 */
//% weight=100 color=#008000 icon="\uf2db" block="iLED4"
namespace iLED4 {
    let segment= [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];
    let displaybuffer: Array<NumberFormat.UInt16BE> = [0, 0, 0, 0, 0, 0, 0, 0];
    function sendCommand(command: iLED4_CMD) {
        pins.i2cWriteNumber(0x70,0,NumberFormat.Int8LE,false)
        pins.i2cWriteNumber(0x70,command,NumberFormat.Int8LE,false)
    }
    function WriteDisplay() {
        let buffer = pins.createBuffer(17);
        buffer[0] = 0x00;
        for (let i = 0; i < 8; i++) {
            buffer[1 + (i * 2) + 0] = displaybuffer[i] & 0xFF;
            buffer[1 + (i * 2) + 1] = displaybuffer[i] >> 8;
        }
        pins.i2cWriteBuffer(0x70, buffer);
    }
    /**
     * set iLED4 intensity, range is [0-15], 0 is off.
     * @param val the brightness of the iLED4, eg: 15
     */
    //% blockId="iLED4_SET_BRIGHTNESS" block="iLED4 set Brightness %bright"
    //% weight=30 blockGap=8
    //% bright.min=0 bright.max=15
    export function setBrightness(bright: number) {
        sendCommand(iLED4_CMD.SET_BRIGHTNESS | bright );
    }


    /**
    * set iLED4 Blink Rate, range is [0-3], 0 is Not Blink.
    * @param set Blink Rate for iLED4, eg: 0
    */
    //% blockId="iLED4_BLINK_RATE" block="iLED4 set Blink Rate %rate"
    //% weight=30 blockGap=8
    //% rate.min=0 rate.max=3
    export function BlinkRate(rate: number) {
        sendCommand(iLED4_CMD.TURN_DISPLAY_ON | (rate & 3) << 1);
    }


    //% blockId="iLED4_INIT" block="Init_iLED4"
    //% weight=98 blockGap=8
    export function init_() {
        pins.P20.setPull(PinPullMode.PullNone)
        pins.P19.setPull(PinPullMode.PullNone)
        sendCommand(iLED4_CMD.TURN_OSCILLATOR_ON)
        sendCommand(iLED4_CMD.TURN_DISPLAY_ON)
        setBrightness(15);
    }

    //% blockId="iLED4_Clear" block="iLED4 Clear"
    //% weight=70 blockGap=8
    export function clear(){
        for (let i = 0; i < 8; i++) {
            displaybuffer[i]=0;
        }
        WriteDisplay();
    }
    //% blockId="iLED4_Turn_ON" block="iLED4 Turn ON"
    //% weight=35 blockGap=8
    export function Turn_ON() {
        sendCommand(0x81);
    }
    //% blockId="iLED4_Turn_OFF" block="iLED4 Turn OFF"
    //% weight=34 blockGap=8
    export function Turn_OFF() {
        sendCommand(0x80);
    }
    /**
    * set iLED4 Colon : , True or False.
    * @param set Colon for iLED4, eg: false
    */
    //% blockId="iLED4_Colon" block="iLED4 Colon %status"
    //% weight=70 blockGap=8
    export function colon(status:boolean) {
        if (status) { displaybuffer[4] = 0x01; }
        else        { displaybuffer[4] = 0x00; }
        WriteDisplay();
    }

    //% blockId="iLED4_ShowDot" block="iLED4 Dotpoint at %digit show %status"
    //% weight=60 blockGap=8
    //% digit.min=0 digit.max=4
    export function ShowDot(digit:number,status: boolean) {
        if (digit==4){colon(status);}
        if (status) { displaybuffer[digit] = displaybuffer[digit] | 0x80; }
        else { displaybuffer[digit] = displaybuffer[digit] & 0x7F; }
        WriteDisplay();
    }

    //% blockId="iLED4_Write_Digit_Dot" block="iLED4 Show Number %num at %digit dot %dot"
    //% weight=75 blockGap=8
    //% digit.min=0 digit.max=3
    //% num.min=0 num.max=15
    export function WriteDigitNum(num:number,digit:number,dot:boolean){
        if (dot) {
            displaybuffer[digit]=segment[num] | 0x80;
        }
        else{
            displaybuffer[digit] = segment[num] ;
        }
        WriteDisplay();
    }
    //% blockId="iLED4_Show_Number" block="iLED4 Show Number %num"
    //% weight=85 blockGap=8
    export function ShowNumber(num: number) {
        if (num<0){
            displaybuffer[0]=0x40;
            num=-num;
        }
        else{
            displaybuffer[0]=segment[Math.idiv(num,1000)%10];
        }
            displaybuffer[1]=segment[Math.idiv(num,100) % 10];
            displaybuffer[2]=segment[Math.idiv(num,10) % 10];
            displaybuffer[3]=segment[num % 10];
        WriteDisplay();
    }
    //% blockId="iLED4_Show_Hex_Number" block="iLED4 Show Hex Number %num"
    //% weight=80 blockGap=8
    export function ShowHexNumber(num: number) {
        if (num < 0) {
            displaybuffer[0] = 0x40;
            num = -num;
        }
        else {
            displaybuffer[0] = segment[(num>>12) % 16];
        }
        displaybuffer[1] = segment[(num>>8) % 16];
        displaybuffer[2] = segment[(num>>4) % 16];
        displaybuffer[3] = segment[num % 16];
        WriteDisplay();
    }
}
